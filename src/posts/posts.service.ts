import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, createPostDto: CreatePostDto) {
        return this.prisma.post.create({
            data: {
                content: createPostDto.content,
                videoURL: createPostDto.videoURL,
                authorId: userId,
                images: createPostDto.images ? {
                    create: createPostDto.images.map(url => ({ url }))
                } : undefined,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        avatar: true,
                    },
                },
                images: true,
            },
        });
    }

    async findAll(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            avatar: true,
                        },
                    },
                    images: true,
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        },
                    },
                },
            }),
            this.prisma.post.count(),
        ]);

        return {
            data: posts,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        avatar: true,
                    },
                },
                images: true,
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: {
                        likes: true,
                    },
                },
            },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        return post;
    }

    async delete(id: string, userId: string) {
        const post = await this.prisma.post.findUnique({
            where: { id },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        if (post.authorId !== userId) {
            throw new ForbiddenException('You can only delete your own posts');
        }

        return this.prisma.post.delete({
            where: { id },
        });
    }
}   