from pydantic import BaseModel,Field

class HouseFeatures(BaseModel):
    
    living_area:float = Field(gt=0,description="Enter the living area")
    grade:int = Field(gt=0,description="Grade of the house")
    num_of_bathrooms:int = Field(gt = 0,description="Number of bathrooms")
    num_of_bedrooms:int = Field(gt = 0,description="Number of bedrooms")
    num_of_floors:int = Field(gt = 0,description="Number of floors")
    
