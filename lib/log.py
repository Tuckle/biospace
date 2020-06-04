import logging
import datetime
from os import makedirs, rename
from os.path import join, dirname, abspath, isdir, exists

logs_folder = join(dirname(dirname(abspath(__file__))), 'logs')
if not isdir(logs_folder):
    makedirs(logs_folder)


def get_logger(name, archive=True):
    path = join(logs_folder, name + '.log')
    if archive and exists(path):
        to_path = path + "." + datetime.datetime.now().strftime("%Y_%m_%d")
        try:
            rename(path, to_path)
        except (OSError, FileExistsError):
            pass

    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    fh = logging.FileHandler(path)
    fh.setLevel(logging.DEBUG)

    ch = logging.StreamHandler()
    ch.setLevel(logging.ERROR)

    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    fh.setFormatter(formatter)
    ch.setFormatter(formatter)

    logger.addHandler(fh)
    logger.addHandler(ch)

    return logger
