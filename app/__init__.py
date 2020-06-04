from .config import create_app
from .index import funcs

app = create_app(funcs=funcs)
