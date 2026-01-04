import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    Request,
    Query,
} from '@nestjs/common';
import { PostsService } from '../posts/posts.service';
import { CreatePostDto } from '../posts/dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    // Route cần authentication
    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Request() req, @Body() createPostDto: CreatePostDto) {
        // req.user chứa thông tin user từ JWT token
        return this.postsService.create(req.user.id, createPostDto);
    }

    // Route công khai (không cần token)
    @Get()
    findAll(@Query('page') page: string, @Query('limit') limit: string) {
        return this.postsService.findAll(+page || 1, +limit || 10);
    }

    // Route công khai
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.postsService.findOne(id);
    }

    // Route cần authentication
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Param('id') id: string, @Request() req) {
        return this.postsService.delete(id, req.user.id);
    }
}