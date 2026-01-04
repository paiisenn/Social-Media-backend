// create-post.dto.ts
import { IsString, IsOptional, IsArray, IsUrl } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @IsOptional()
    content?: string;

    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    images?: string[];

    @IsOptional()
    @IsUrl()
    videoURL?: string;
}