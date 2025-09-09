from sqlalchemy import Column, Integer, String, Text, ForeignKey
from database import Base

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, nullable=False)
    reviewer = Column(String, nullable=False)
    content = Column(Text)
    rating = Column(Integer, nullable=False)
