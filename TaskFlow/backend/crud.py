from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone
import models, schemas, auth

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session):
    return db.query(models.User).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, name=user.name, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_project(db: Session, project: schemas.ProjectCreate, user_id: int):
    db_project = models.Project(**project.model_dump(), admin_id=user_id)
    db.add(db_project)
    
    user = db.get(models.User, user_id)
    if user:
        db_project.members.append(user)
        
    db.commit()
    db.refresh(db_project)
    return db_project

def get_projects(db: Session, user_id: int):
    user = db.get(models.User, user_id)
    if user:
        return user.projects_joined
    return []

def get_project(db: Session, project_id: int):
    return db.get(models.Project, project_id)

def add_member_to_project(db: Session, project_id: int, user_email: str):
    project = db.get(models.Project, project_id)
    user = db.query(models.User).filter(models.User.email == user_email).first()
    if project and user:
        if user not in project.members:
            project.members.append(user)
            db.commit()
            return True
    return False

def update_project(db: Session, project_id: int, project_update: schemas.ProjectUpdate):
    db_project = db.get(models.Project, project_id)
    if db_project:
        update_data = project_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_project, key, value)
        db.commit()
        db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int):
    db_project = db.get(models.Project, project_id)
    if db_project:
        db.delete(db_project)
        db.commit()
        return True
    return False

def create_task(db: Session, task: schemas.TaskCreate):
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def get_tasks_for_project(db: Session, project_id: int, status: str = None, assigned_to_id: int = None, search: str = None):
    query = db.query(models.Task).filter(models.Task.project_id == project_id)
    if status:
        query = query.filter(models.Task.status == status)
    if assigned_to_id:
        query = query.filter(models.Task.assigned_to_id == assigned_to_id)
    if search:
        query = query.filter(models.Task.title.ilike(f"%{search}%"))
    return query.all()

def get_task(db: Session, task_id: int):
    return db.get(models.Task, task_id)

def update_task(db: Session, task_id: int, task_update: schemas.TaskUpdate):
    db_task = db.get(models.Task, task_id)
    if db_task:
        update_data = task_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_task, key, value)
        db.commit()
        db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int):
    db_task = db.get(models.Task, task_id)
    if db_task:
        db.delete(db_task)
        db.commit()
        return True
    return False

def get_dashboard_stats(db: Session, user_id: int):
    user = db.get(models.User, user_id)
    if not user:
        return {"total_tasks": 0, "tasks_by_status": {}, "tasks_per_user": {}, "overdue_tasks": 0}
        
    project_ids = [p.id for p in user.projects_joined]
    if not project_ids:
        return {"total_tasks": 0, "tasks_by_status": {}, "tasks_per_user": {}, "overdue_tasks": 0}

    tasks = db.query(models.Task).filter(models.Task.project_id.in_(project_ids)).all()
    
    total = len(tasks)
    by_status = {}
    per_user = {}
    overdue = 0
    now = datetime.now(timezone.utc)
    
    for t in tasks:
        # Status
        status_val = t.status.value
        by_status[status_val] = by_status.get(status_val, 0) + 1
        
        # User assigned
        if t.assigned_to_id:
            uname = t.assignee.name if t.assignee else "Unknown"
            per_user[uname] = per_user.get(uname, 0) + 1
        else:
            per_user["Unassigned"] = per_user.get("Unassigned", 0) + 1
            
        # Overdue (ensuring t.due_date is timezone-aware if needed, but assuming naive for now as per models)
        # Standard SQLAlchemy DateTime is naive. 
        # If the user's due_date is naive, we should compare with naive now.
        naive_now = datetime.now()
        if t.due_date and t.due_date < naive_now and t.status != models.TaskStatus.done:
            overdue += 1
            
    return {
        "total_tasks": total,
        "tasks_by_status": by_status,
        "tasks_per_user": per_user,
        "overdue_tasks": overdue
    }
