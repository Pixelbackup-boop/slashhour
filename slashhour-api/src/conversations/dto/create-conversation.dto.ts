import { IsString, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @IsUUID()
  business_id: string;
}
