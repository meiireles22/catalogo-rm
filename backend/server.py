from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
from pydantic import BaseModel
from typing import List, Optional
import uuid

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'catalogo_ribeiro')]

# Create the main app
app = FastAPI(title="Ribeiro & Moreira - Catalogo API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Utilizadores
USERS = {
    "admin": {"password": "ribeiro2026", "role": "admin"},
    "comercial": {"password": "comercial123", "role": "user"}
}

# Models
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    role: str = ""
    username: str = ""

class ProductCreate(BaseModel):
    name: str
    description: str
    image: str
    category_id: str
    specs: Optional[dict] = {}
    cotacoes_image: Optional[str] = ""

class Product(BaseModel):
    id: str
    name: str
    description: str
    image: str
    category_id: str
    specs: dict = {}
    cotacoes_image: str = ""

# Routes
@api_router.get("/")
async def root():
    return {"message": "Ribeiro & Moreira - Catalogo API", "status": "online"}

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    user = USERS.get(request.username)
    if user and user["password"] == request.password:
        return LoginResponse(
            success=True, 
            message="Login bem sucedido",
            role=user["role"],
            username=request.username
        )
    raise HTTPException(status_code=401, detail="Credenciais invalidas")

@api_router.get("/products/{category_id}", response_model=List[Product])
async def get_products(category_id: str):
    products = await db.products.find({"category_id": category_id}, {"_id": 0}).to_list(100)
    return products

@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    product_dict = product.model_dump()
    product_dict["id"] = str(uuid.uuid4())
    await db.products.insert_one(product_dict)
    return Product(**product_dict)

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product: ProductCreate):
    product_dict = product.model_dump()
    product_dict["id"] = product_id
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": product_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Produto nao encontrado")
    return Product(**product_dict)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produto nao encontrado")
    return {"message": "Produto eliminado com sucesso"}

@api_router.put("/static-products/{product_id}")
async def update_static_product(product_id: str, product: ProductCreate):
    product_dict = product.model_dump()
    product_dict["id"] = product_id
    product_dict["is_static_edit"] = True
    
    existing = await db.static_edits.find_one({"id": product_id})
    if existing:
        await db.static_edits.update_one({"id": product_id}, {"$set": product_dict})
    else:
        await db.static_edits.insert_one(product_dict)
    
    return Product(**product_dict)

@api_router.get("/static-products/edits")
async def get_static_edits():
    edits = await db.static_edits.find({}, {"_id": 0}).to_list(100)
    return edits

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve React frontend (built files)
build_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "build")
if os.path.exists(build_path):
    app.mount("/static", StaticFiles(directory=os.path.join(build_path, "static")), name="static")
    app.mount("/icons", StaticFiles(directory=os.path.join(build_path, "icons")), name="icons")
    app.mount("/images", StaticFiles(directory=os.path.join(build_path, "images")), name="images")

    @app.get("/manifest.json")
    async def serve_manifest():
        return FileResponse(os.path.join(build_path, "manifest.json"))

    @app.get("/sw.js")
    async def serve_sw():
        return FileResponse(os.path.join(build_path, "sw.js"), media_type="application/javascript")

    @app.get("/{full_path:path}")
    async def serve_react(full_path: str):
        file_path = os.path.join(build_path, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(build_path, "index.html"))

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()