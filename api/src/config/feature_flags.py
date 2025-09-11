from dataclasses import dataclass

@dataclass
class FeatureFlags:
    ENABLE_VISION: bool = False
    ENABLE_VIDEO: bool = False
    ENABLE_EMBEDDINGS: bool = True
    ENABLE_SOTA_DATASET_BUILDER: bool = False
    ENABLE_SOTA_POST_PARSER: bool = False

FLAGS = FeatureFlags()
