import api from './api'
import type { CommunityPost, CreateCommunityPostRequest } from '../types/community.types'

export const getCommunityPosts = async () => {
  const { data } = await api.get<CommunityPost[]>('/community/posts')
  return data
}

export const createCommunityPost = async (payload: CreateCommunityPostRequest) => {
  const { data } = await api.post<CommunityPost>('/community/posts', payload)
  return data
}
