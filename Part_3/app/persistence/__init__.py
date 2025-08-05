from os import getenv
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine, text, select
from sqlalchemy.orm import scoped_session, sessionmaker

# Hardcoded credentials - PLEASE DON'T DO THIS IN PRODUCTION
USER = "root"
PWD = ""
HOST = "localhost"
DB = "hbnbV4"

Base = declarative_base()

engine = create_engine('mysql+mysqldb://{}:{}@{}/{}'.format(USER, PWD, HOST, DB))
Base.metadata.create_all(engine)
session_factory = sessionmaker(
    bind=engine, expire_on_commit=False)
session = scoped_session(session_factory)

db_session = session()
