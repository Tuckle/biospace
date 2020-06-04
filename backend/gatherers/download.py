import os
import sys
import uuid
import time
import queue
import shutil
import requests
import threading
import traceback
import subprocess
from models.neo import Paper
from functools import partial
from multiprocessing.pool import ThreadPool

executables = sys.argv[1:]
headers = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36"
}
DOI_PAGE_NOT_FOUND = b"<title>Page Not Found</title>"
DOI_NOT_FOUND = b"<title>Error: DOI Not Found</title>"


def get_ids(to_path):
    ids = list(map(lambda x: x["id"], Paper.get_all("id")))
    with open(to_path, "w") as output:
        output.write("\n".join(ids) + "\n")


def check_doi(_id):
    try:
        if _id.startswith('doi://'):
            _id = _id.replace('doi:/', 'http://doi.org')
        with requests.get(_id, headers=headers) as r:
            r.raise_for_status()
            content = r.content
            if DOI_NOT_FOUND in content or DOI_PAGE_NOT_FOUND in content:
                return None
        return _id
    except requests.HTTPError as hexe:
        print(str(hexe), hexe.response.status_code)
        return hexe.response.status_code
    except requests.RequestException:
        return None


def check_pubmed(_id):
    try:
        if _id.startswith('pubmed://'):
            _id = _id.replace('pubmed:/', 'https://pubmed.ncbi.nlm.nih.gov')
        with requests.get(_id, headers=headers) as r:
            r.raise_for_status()
        return _id
    except requests.HTTPError as hexe:
        print(str(hexe), hexe.response.status_code)
        return hexe.response.status_code
    except requests.RequestException:
        return None


def check(_id, q=None):
    if _id.startswith('doi://'):
        if q:
            q.put((_id, "doi", check_doi(_id)))
        return "doi", check_doi(_id)
    elif _id.startswith('pubmed://'):
        if q:
            q.put((_id, "pubmed", check_pubmed(_id)))
        return "pubmed", check_pubmed(_id)
    else:
        if q:
            q.put((_id, "unknown", _id))
        return "unknown", _id


def append(file_path, lines):
    if not os.path.exists(file_path):
        with open(file_path, "w"):
            pass
    with open(file_path, "a+") as o:
        o.write("\n".join(lines) + "\n")


def filter_ids(file_path):
    ids = dict()
    with open(file_path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            source, result = check(line)
            key = source if isinstance(result, str) else source + "_nf"
            if key not in ids:
                ids[key] = list()
            ids[key].append("{}|||{}".format(line, result) if result else line)
            if len(ids[key]) >= 100:
                append(file_path + "." + key, ids[key])
                ids[key] = list()
        else:
            for key in ids:
                if ids[key]:
                    append(file_path + "." + key, ids[key])


def empty_filter_queue(q, file_path):
    while True:
        while q.empty():
            time.sleep(1)
        while not q.empty():
            try:
                line, source, result = q.get(timeout=5)
                key = source if isinstance(result, str) else source + "_nf"
                append(
                    file_path + "." + key,
                    ["{}|||{}".format(line, result) if result else line])
            except:
                pass


def filter_ids_multi(file_path):
    q = queue.Queue(15000)
    check_func = partial(check, q=q)
    with open(file_path) as f:
        all_ids = list(set(map(lambda x: x.strip(), f.read().strip().split('\n'))))
    for key in ["doi", "pubmed", "unknown"]:
        for ext in ["_nf", ""]:
            existing = file_path + "." + key + ext
            if not os.path.isfile(existing):
                continue
            with open(existing) as f:
                processed = list(map(lambda x: x.strip().split('|||')[0], f.read().strip().split('\n')))
                if processed:
                    all_ids = list(set(all_ids).difference(set(processed)))
    writer = threading.Thread(target=empty_filter_queue, args=(q, file_path,))
    writer.daemon = True
    writer.start()
    print("Remaining", len(all_ids))
    with ThreadPool(23) as tp:
        tp.map(check_func, all_ids)
        tp.close()
        tp.join()
    print("Joining queue")
    q.join()
    print("Filter done")


def download_doi(_id, script=None, timeout=60 * 3):
    if _id.startswith('doi://'):
        _id = _id.replace('doi:/', 'http://doi.org')
    uid = str(uuid.uuid4()) + ".pdf"
    try:
        if not script:
            script = executables[0]
        command = [sys.executable, script, "-d", _id, "-f", uid]
        output = subprocess.check_output(command, timeout=timeout).decode('utf-8', 'replace').split('\r\n')
        file_path = os.path.abspath(uid)
        to_path = os.path.join(executables[1], uid)
        try:
            shutil.move(file_path, to_path)
        except (shutil.Error, FileNotFoundError) as sher:
            print("sher", str(sher), output)
            if os.path.isfile(file_path):
                os.remove(file_path)
            return None
        return uid
    except subprocess.SubprocessError as ser:
        print("ser", str(ser))
        return None
    except Exception:
        traceback.print_exc()
        return None


def download_dois(from_path):
    processed = set()
    if os.path.isfile(from_path + ".downloaded.ok"):
        with open(from_path + ".downloaded.ok") as f:
            lines = list(map(lambda x: x.split('|||')[0], f.read().strip().split('\n')))
            processed.update(lines)
    if os.path.isfile(from_path + ".downloaded.failed"):
        with open(from_path + ".downloaded.failed") as f:
            processed.update(f.read().strip().split('\n'))
    with open(from_path) as f:
        downloaded = dict(ok=list(), failed=list())
        for line in f:
            line = line.strip()
            if not line:
                continue
            line = line.split('|||')[-1]
            if line in processed:
                processed.remove(line)
                continue
            result = download_doi(line)
            if not result and len(executables) >= 3:
                for i in range(2, len(executables)):
                    result = download_doi(line, executables[i], timeout=60 * 10)
                    if result:
                        break
            key = "ok"
            if result:
                downloaded["ok"].append("{}|||{}".format(line, result))
                time.sleep(1)
            else:
                downloaded["failed"].append(line)
                key = "failed"
            if len(downloaded[key]) > 100:
                append(from_path + ".downloaded." + key, downloaded[key])
                downloaded[key] = list()
        else:
            for key in downloaded:
                if downloaded[key]:
                    append(from_path + ".downloaded." + key, downloaded[key])


def download_doi_(_id, timeout=60 * 5):
    for i in {0} | set(list(range(2, len(executables)))):
        result = partial(download_doi, script=executables[i], timeout=timeout)(_id)
        if not result:
            continue
        doi_path = os.path.join(executables[1], result)
        if os.path.isfile(doi_path):
            with open(doi_path + ".id", "w") as o:
                o.write(_id)
            break
    else:
        print("Failed to get doi", _id)


def download_dois_parallel(from_path):
    processed = set()
    if os.path.isfile(from_path + ".downloaded.ok"):
        with open(from_path + ".downloaded.ok") as f:
            lines = list(map(lambda x: x.split('|||')[0], f.read().strip().split('\n')))
            processed.update(lines)
    if os.path.isfile(from_path + ".downloaded.failed"):
        with open(from_path + ".downloaded.failed") as f:
            processed.update(f.read().strip().split('\n'))
    if os.path.isdir(executables[1]):
        for fo in os.scandir(executables[1]):
            if not fo.name.endswith('.pdf'):
                continue
            if os.path.isfile(fo.path + ".id"):
                with open(fo.path + ".id") as f:
                    processed.add(f.read().strip())
    print("processed", len(processed))
    with open(from_path) as f:
        dois = list(map(lambda x: x.split('|||')[-1], f.read().strip().split('\n')))
    dois = list(set(dois).difference(processed))
    with ThreadPool(7) as tp:
        tp.map(download_doi_, dois)


if __name__ == '__main__':
    path = r"C:\Users\apiriu\Documents\Me\Projects\repos\sciload\ids.dmp"
    # download_dois_parallel(path + ".doi")
    # filter_ids_multi(path)

    # download_dois(path + ".doi")  # .downloaded.failed
    # get_ids(path)
    # filter_ids(file_path=path)
