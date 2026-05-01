from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

import models, schemas, crud, auth
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Team Task Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MemberAddRequest(BaseModel):
    email: str

@app.post("/api/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/api/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, form_data.username)
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/api/users", response_model=List[schemas.UserResponse])
def get_all_users(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.get_users(db)

# Projects
@app.post("/api/projects", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.create_project(db=db, project=project, user_id=current_user.id)

@app.get("/api/projects", response_model=List[schemas.ProjectResponse])
def read_projects(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.get_projects(db=db, user_id=current_user.id)

@app.get("/api/projects/{project_id}", response_model=schemas.ProjectResponse)
def read_project(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user is a member or admin
    member_ids = [m.id for m in project.members]
    if current_user.id != project.admin_id and current_user.id not in member_ids:
        raise HTTPException(status_code=403, detail="Not authorized to view this project")
    return project

@app.put("/api/projects/{project_id}", response_model=schemas.ProjectResponse)
def update_project(project_id: int, project_update: schemas.ProjectUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.admin_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only admin can edit project")
    return crud.update_project(db, project_id, project_update)

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.admin_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only admin can delete project")
    crud.delete_project(db, project_id)
    return {"message": "Project deleted successfully"}

@app.post("/api/projects/{project_id}/members")
def add_member(project_id: int, req: MemberAddRequest, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.admin_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only admin can add members")
    success = crud.add_member_to_project(db, project_id, req.email)
    if not success:
        raise HTTPException(status_code=400, detail="User not found or already in project")
    return {"message": "Member added successfully"}

# Tasks
@app.post("/api/tasks", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    project = crud.get_project(db, task.project_id)
    if not project:
         raise HTTPException(status_code=404, detail="Project not found")
    if project.admin_id != current_user.id:
         raise HTTPException(status_code=403, detail="Only admin can create tasks for this project")
    return crud.create_task(db=db, task=task)

@app.get("/api/projects/{project_id}/tasks", response_model=List[schemas.TaskResponse])
def get_tasks(
    project_id: int, 
    status: Optional[str] = None,
    assigned_to_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    member_ids = [m.id for m in project.members]
    if current_user.id != project.admin_id and current_user.id not in member_ids:
        raise HTTPException(status_code=403, detail="Not authorized to view these tasks")
    return crud.get_tasks_for_project(db, project_id, status=status, assigned_to_id=assigned_to_id, search=search)

@app.put("/api/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    task = crud.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    project = task.project
    
    if project.admin_id == current_user.id:
        return crud.update_task(db, task_id, task_update)
    elif task.assigned_to_id == current_user.id:
        # Member can only update status
        # We ensure only status is updated even if other fields are sent
        allowed_update = schemas.TaskUpdate(status=task_update.status)
        return crud.update_task(db, task_id, allowed_update)
    else:
        raise HTTPException(status_code=403, detail="Not authorized to update this task")

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    task = crud.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.project.admin_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only admin can delete tasks")
    crud.delete_task(db, task_id)
    return {"message": "Task deleted successfully"}

@app.get("/api/dashboard", response_model=schemas.DashboardResponse)
def get_dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.get_dashboard_stats(db, current_user.id)
