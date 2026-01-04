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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Request() req, @Body() createPostDto: CreatePostDto) {
        return this.postsService.create(req.user.id, createPostDto);
    }

    @Get()
    findAll(@Query('page') page: string, @Query('limit') limit: string) {
        return this.postsService.findAll(+page || 1, +limit || 10);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.postsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Param('id') id: string, @Request() req) {
        return this.postsService.delete(id, req.user.id);
    }
}