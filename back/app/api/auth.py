from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db_dep
from app.integrations.oneid_client import OneIDClient
from app.models.entities import RoleName
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, OneIDCallbackRequest, TokenResponse
from app.schemas.user import UserRead
from app.services.auth_service import authenticate_user, issue_token_for_user, register_user

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db_dep)) -> TokenResponse:
    user = authenticate_user(db, payload.username, payload.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = issue_token_for_user(user)
    return TokenResponse(access_token=token)


@router.post("/oneid/callback", response_model=TokenResponse)
def oneid_callback(payload: OneIDCallbackRequest, db: Session = Depends(get_db_dep)) -> TokenResponse:
    oneid_user = OneIDClient().exchange_code(payload.code)

    repo = UserRepository(db)
    user = repo.get_by_username(oneid_user.username)
    if user is None:
        user = register_user(
            db,
            username=oneid_user.username,
            email=oneid_user.email,
            password="oneid-temporary",
            role_name=RoleName.EMPLOYEE,
        )

    token = issue_token_for_user(user)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserRead)
def me(current_user=Depends(get_current_user)) -> UserRead:
    return current_user
