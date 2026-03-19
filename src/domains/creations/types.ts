export type UserCreation = {
  id: string;
  originalPhotoUrl: string;
  generatedUrls: string[];
  styleId: string;
  generationId: string;
  createdAt: string;
};

export type UserCreationsData = UserCreation[];
