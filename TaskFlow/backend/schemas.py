from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime
from models import TaskStatus, TaskPriority

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    
    class Config:
        from_attributes = True

# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.medium
    status: TaskStatus = TaskStatus.todo
    project_id: int
    assigned_to_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    assigned_to_id: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    
    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    admin_id: int
    members: List[UserResponse] = []
    
    class Config:
        from_attributes = True

class DashboardResponse(BaseModel):
    total_tasks: int
    tasks_by_status: Dict[str, int]
    tasks_per_user: Dict[str, int]
    overdue_tasks: int

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
