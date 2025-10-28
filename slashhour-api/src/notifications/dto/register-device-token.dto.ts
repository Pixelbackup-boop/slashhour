import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';

export class RegisterDeviceTokenDto {
  @IsString()
  @IsNotEmpty()
  device_token: string;

  @IsEnum(['ios', 'android', 'web'])
  device_type: 'ios' | 'android' | 'web';

  @IsString()
  @IsOptional()
  device_name?: string;
}
