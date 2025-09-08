
from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType
from typing import List
from sentence_transformers import SentenceTransformer

class MilvusEngine:
    def __init__(self, collection_name="project_dhruv"):
        self.collection_name = collection_name
        self.model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
        connections.connect(alias="default", host="localhost", port="19530")
        self.collection = self._create_collection_if_not_exists()

    def _create_collection_if_not_exists(self):
        if self.collection_name not in connections.list_collections():
            fields = [
                FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
                FieldSchema(name="timestamp", dtype=DataType.VARCHAR, max_length=64),
                FieldSchema(name="content", dtype=DataType.VARCHAR, max_length=4096),
                FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=384),
                FieldSchema(name="sentiment", dtype=DataType.VARCHAR, max_length=20),
                FieldSchema(name="purpose", dtype=DataType.VARCHAR, max_length=50),
                FieldSchema(name="parsed_metadata", dtype=DataType.JSON),
            ]
            schema = CollectionSchema(fields, "Project Dhruv Posts")
            collection = Collection(self.collection_name, schema)
            index_params = {
                "metric_type": "L2",
                "index_type": "IVF_FLAT",
                "params": {"nlist": 1024},
            }
            collection.create_index("embedding", index_params)
        else:
            collection = Collection(self.collection_name)
        collection.load()
        return collection

    def insert(self, data: List[dict]):
        self.collection.insert(data)

    def search(self, text: str, top_k=5) -> List[dict]:
        embedding = self.model.encode(text, convert_to_tensor=False).tolist()
        search_params = {"metric_type": "L2", "params": {"nprobe": 10}}
        results = self.collection.search(
            data=[embedding],
            anns_field="embedding",
            param=search_params,
            limit=top_k,
            expr=None,
            output_fields=["timestamp", "content", "sentiment", "purpose", "parsed_metadata"]
        )
        return results[0]

def train_model(data_path: str):
    # Train the model and store it in Milvus
    pass
