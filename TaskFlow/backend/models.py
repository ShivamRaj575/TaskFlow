from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum as SAEnum, Table
from sqlalchemy.orm import relationship
import enum
from database import Base

class TaskStatus(str, enum.Enum):
    todo = "To Do"
    in_progress = "In Progress"
    done = "Done"

class TaskPriority(str, enum.Enum):
    low = "Low"
    medium = "Medium"
    high = "High"

project_members = Table(
    "project_members",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id", ondelete="CASCADE")),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"))
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    
    # relationships
    projects_owned = relationship("Project", back_populates="admin", cascade="all, delete-orphan")
    projects_joined = relationship("Project", secondary=project_members, back_populates="members")
    tasks_assigned = relationship("Task", back_populates="assignee")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    admin_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    
    admin = relationship("User", back_populates="projects_owned")
    members = relationship("User", secondary=project_members, back_populates="projects_joined")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    due_date = Column(DateTime, nullable=True)
    priority = Column(SAEnum(TaskPriority), default=TaskPriority.medium)
    status = Column(SAEnum(TaskStatus), default=TaskStatus.todo)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    assigned_to_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="tasks_assigned")
