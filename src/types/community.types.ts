export interface CommunityPost {
  id: number
  title: string
  content: string
  authorName: string
  createdAt: string
}

export interface CreateCommunityPostRequest {
  title: string
  content: string
}
