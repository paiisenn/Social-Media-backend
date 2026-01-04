export class UserProfileDto {
    id: string
    name: string
    email: string
    bio?: string
    avatar?: string
    coverImage?: string
    location?: string
    website?: string
    createdAt: Date
    _count?: {
        followers: number
        following: number
        posts: number
    }
}