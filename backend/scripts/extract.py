import os
import sys
import json
import textract
from functools import partial
from mrakun import RakunDetector
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from multiprocessing.pool import ThreadPool
from backend.gatherers.metadatas_finder import get_id_mapping, add_doi_keys

hyperparameters = {
    "distance_threshold": 4,
    "distance_method": "editdistance",  # fasttext
    # "pretrained_embedding_path": sys.argv[3],
    "num_keywords": 10,
    "pair_diff_length": 2,
    "stopwords": stopwords.words('english'),
    "bigram_count_threshold": 2,
    "lemmatizer": WordNetLemmatizer(),
    "num_tokens": [1, 2]
}


def extract_file(from_path, to_path=None, override=False):
    if to_path is None:
        to_path = os.path.splitext(to_path)[0] + ".txt"
    elif os.path.isdir(to_path):
        to_path = os.path.join(to_path, os.path.splitext(os.path.basename(from_path))[0] + '.txt')
    if not override and os.path.isfile(to_path):
        return
    try:
        content = textract.process(from_path)
        with open(to_path, "wb") as o:
            o.write(content)
    except UnicodeDecodeError:
        pass
    except Exception as ex:
        print(from_path)
        import traceback
        # traceback.print_exc()
        print(str(ex))


def extract_all(from_path, to_path, threads=30):
    if not os.path.isdir(to_path):
        os.makedirs(to_path)
    pdfs = list(map(lambda x: os.path.join(from_path, x),
                    filter(lambda x: x.endswith('.pdf'), os.listdir(from_path))))
    extract_pdf = partial(extract_file, to_path=to_path)
    with ThreadPool(threads) as tp:
        tp.map(extract_pdf, pdfs)
        tp.close()
        tp.join()


def get_keywords(from_path, save_to=None, vis=False, override=False):
    if save_to is True:
        save_to = os.path.splitext(from_path)[0] + ".keys.json"
    elif save_to and os.path.isdir(save_to):
        save_to = os.path.join(save_to, os.path.basename(from_path) + ".keys.json")
    if save_to and os.path.isfile(save_to) and not override:
        return

    keyword_detector = RakunDetector(hyperparameters)
    try:
        keywords = keyword_detector.find_keywords(from_path)
    except UnicodeDecodeError:
        try:
            with open(from_path, "r", encoding="utf-8") as f:
                text = f.read()
        except UnicodeDecodeError:
            return
        keywords = keyword_detector.find_keywords(text, input_type="text")
    if vis:
        print(keywords, flush=True)
        keyword_detector.visualize_network()

    if save_to:
        with open(save_to, "w") as out:
            json.dump(keywords, out)
        return save_to


def extract_all_keywords(from_path, threads=5):
    files = list(map(lambda x: os.path.join(from_path, x),
                     filter(lambda x: x.endswith('.txt'), os.listdir(from_path))))
    extract_keys = partial(get_keywords, save_to=True)
    with ThreadPool(threads) as tp:
        tp.map(extract_keys, files)
        tp.close()
        tp.join()


def add_extracted():
    ids = get_id_mapping(sys.argv[4], sys.argv[1])
    folder = sys.argv[2]
    count = 0
    for fo in filter(lambda x: x.name.endswith('.keys.json'), os.scandir(folder)):
        id_ = fo.name[:-10]
        doi = ids.get(id_)
        if not doi:
            continue
        with open(fo.path) as f:
            keys = json.load(f)
        keywords = list(filter(lambda x: x[1] >= 0.015, keys))
        if not keywords:
            keywords = keys[:3]
        keywords = list(map(lambda x: x[0], keywords))
        if not keywords:
            continue
        add_doi_keys(doi, keywords)
        count += 1
        if count % 100 == 0:
            print("Added", count)


if __name__ == '__main__':
    add_extracted()
    # extract_all(sys.argv[1], sys.argv[2], 30)
    # extract_all_keywords(sys.argv[2])
    # get_keywords(r"D:\disertatie\extracted\cb10f288-4784-4a60-91c5-f74efc0bfc80.txt", vis=True)
