import { IsArray, IsString } from 'class-validator';

export class MarkAsReadDto {
  @IsArray()
  @IsString({ each: true})
  notification_ids: string[];
}
