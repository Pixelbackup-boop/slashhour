import { IsString, IsOptional, IsEnum, Length } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @Length(1, 5000)
  message_text: string;

  @IsOptional()
  @IsEnum(['text', 'image'])
  message_type?: string;
}
