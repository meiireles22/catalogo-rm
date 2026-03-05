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
mongo_url = os.environ.get('MONGO_URL')
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

class VideoCreate(BaseModel):
    title: str
    url: str
    type: str = "youtube"

class Video(BaseModel):
    id: str
    title: str
    url: str
    type: str = "youtube"

class ParametrosUpdate(BaseModel):
    parametros: list

class DeletedProductId(BaseModel):
    product_id: str

# ============ AUTH ============
@api_router.get("/")
async def root():
    return {"message": "Ribeiro & Moreira - Catalogo API", "status": "online"}

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    user = USERS.get(request.username)
    if user and user["password"] == request.password:
        return LoginResponse(success=True, message="Login bem sucedido", role=user["role"], username=request.username)
    raise HTTPException(status_code=401, detail="Credenciais invalidas")

# ============ PRODUCTS ============
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
    result = await db.products.update_one({"id": product_id}, {"$set": product_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Produto nao encontrado")
    return Product(**product_dict)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produto nao encontrado")
    return {"message": "Produto eliminado com sucesso"}

# ============ STATIC PRODUCT EDITS ============
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

# ============ DELETED PRODUCTS ============
@api_router.get("/deleted-products")
async def get_deleted_products():
    doc = await db.deleted_products.find_one({"type": "deleted_list"}, {"_id": 0})
    if doc:
        return {"ids": doc.get("ids", [])}
    return {"ids": []}

@api_router.post("/deleted-products")
async def add_deleted_product(data: DeletedProductId):
    doc = await db.deleted_products.find_one({"type": "deleted_list"})
    if doc:
        ids = doc.get("ids", [])
        if data.product_id not in ids:
            ids.append(data.product_id)
        await db.deleted_products.update_one({"type": "deleted_list"}, {"$set": {"ids": ids}})
    else:
        await db.deleted_products.insert_one({"type": "deleted_list", "ids": [data.product_id]})
    return {"message": "Produto marcado como eliminado"}

# ============ VIDEOS ============
@api_router.get("/videos")
async def get_videos():
    videos = await db.videos.find({}, {"_id": 0}).to_list(100)
    return videos

@api_router.post("/videos")
async def create_video(video: VideoCreate):
    video_dict = video.model_dump()
    video_dict["id"] = f"video-{uuid.uuid4().hex[:8]}"
    await db.videos.insert_one(video_dict)
    return Video(**video_dict)

@api_router.put("/videos/{video_id}")
async def update_video(video_id: str, video: VideoCreate):
    video_dict = video.model_dump()
    video_dict["id"] = video_id
    result = await db.videos.update_one({"id": video_id}, {"$set": video_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Video nao encontrado")
    return Video(**video_dict)

@api_router.delete("/videos/{video_id}")
async def delete_video(video_id: str):
    result = await db.videos.delete_one({"id": video_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Video nao encontrado")
    return {"message": "Video eliminado com sucesso"}

# ============ PARAMETROS LASER ============
@api_router.get("/parametros/laser")
async def get_parametros_laser():
    doc = await db.parametros.find_one({"type": "laser"}, {"_id": 0})
    if doc:
        return {"parametros": doc.get("parametros", [])}
    return {"parametros": []}

@api_router.put("/parametros/laser")
async def save_parametros_laser(data: ParametrosUpdate):
    existing = await db.parametros.find_one({"type": "laser"})
    if existing:
        await db.parametros.update_one({"type": "laser"}, {"$set": {"parametros": data.parametros}})
    else:
        await db.parametros.insert_one({"type": "laser", "parametros": data.parametros})
    return {"message": "Parametros laser guardados"}

# ============ PARAMETROS QUINAGEM ============
@api_router.get("/parametros/quinagem")
async def get_parametros_quinagem():
    doc = await db.parametros.find_one({"type": "quinagem"}, {"_id": 0})
    if doc:
        return {"parametros": doc.get("parametros", [])}
    return {"parametros": []}

@api_router.put("/parametros/quinagem")
async def save_parametros_quinagem(data: ParametrosUpdate):
    existing = await db.parametros.find_one({"type": "quinagem"})
    if existing:
        await db.parametros.update_one({"type": "quinagem"}, {"$set": {"parametros": data.parametros}})
    else:
        await db.parametros.insert_one({"type": "quinagem", "parametros": data.parametros})
    return {"message": "Parametros quinagem guardados"}

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
    icons_path = os.path.join(build_path, "icons")
    if os.path.exists(icons_path):
        app.mount("/icons", StaticFiles(directory=icons_path), name="icons")
    images_path = os.path.join(build_path, "images")
    if os.path.exists(images_path):
        app.mount("/images", StaticFiles(directory=images_path), name="images")

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
