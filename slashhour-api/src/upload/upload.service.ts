import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

@Injectable()
export class UploadService {
  private uploadDir: string;
  private baseUrl: string;

  constructor(private configService: ConfigService) {
    // Use uploads directory in project root
    this.uploadDir = path.join(process.cwd(), 'uploads');

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // Base URL for accessing uploaded files
    // Use actual server IP instead of localhost for mobile device access
    const port = this.configService.get('PORT', 3000);
    const host = this.configService.get('SERVER_HOST', this.getLocalIP());
    this.baseUrl = `http://${host}:${port}/uploads`;

    console.log(`📁 UploadService initialized - Files will be accessible at: ${this.baseUrl}`);
  }

  /**
   * Get local IP address of the server
   * This allows mobile devices to access uploaded files
   */
  private getLocalIP(): string {
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();

    for (const interfaceName of Object.keys(networkInterfaces)) {
      const interfaces = networkInterfaces[interfaceName];
      for (const iface of interfaces) {
        // Skip internal (localhost) and non-IPv4 addresses
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }

    // Fallback to localhost if no external IP found
    return 'localhost';
  }

  /**
   * Check if file is an image based on mimetype
   */
  private isImage(mimetype: string): boolean {
    return mimetype.startsWith('image/');
  }

  /**
   * Save file to disk and return public URL
   * Images are automatically converted to AVIF format
   * @param file Uploaded file from multer
   * @param folder Optional subfolder (e.g., 'deals', 'businesses')
   * @returns Public URL to access the file
   */
  async saveFile(file: Express.Multer.File, folder?: string): Promise<string> {
    // Generate unique filename - use .avif for images
    const isImage = this.isImage(file.mimetype);

    // DEBUG: Log file info to diagnose AVIF conversion issue
    console.log(`📤 Uploading file:`);
    console.log(`   - Original name: ${file.originalname}`);
    console.log(`   - MIME type: ${file.mimetype}`);
    console.log(`   - Is image? ${isImage}`);
    console.log(`   - Buffer size: ${file.buffer.length} bytes`);

    const fileExtension = isImage ? '.avif' : path.extname(file.originalname);
    const filename = `${uuidv4()}${fileExtension}`;

    // Determine save path
    let savePath = this.uploadDir;
    if (folder) {
      savePath = path.join(this.uploadDir, folder);
      if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath, { recursive: true });
      }
    }

    const filePath = path.join(savePath, filename);

    // Convert images to AVIF format
    if (isImage) {
      try {
        await sharp(file.buffer)
          .avif({
            quality: 80,         // Good balance between quality and file size
            effort: 4,           // Compression effort (0-9, 4 is default)
          })
          .toFile(filePath);

        console.log(`✅ Converted image to AVIF: ${filename}`);
      } catch (error) {
        console.error(`❌ Failed to convert image to AVIF:`, error);
        throw error;
      }
    } else {
      // Non-image files: save as-is
      fs.writeFileSync(filePath, file.buffer);
    }

    // Return public URL
    const url = folder
      ? `${this.baseUrl}/${folder}/${filename}`
      : `${this.baseUrl}/${filename}`;

    return url;
  }

  /**
   * Save multiple files to disk
   * @param files Array of uploaded files
   * @param folder Optional subfolder
   * @returns Array of public URLs
   */
  async saveFiles(files: Express.Multer.File[], folder?: string): Promise<string[]> {
    return Promise.all(files.map(file => this.saveFile(file, folder)));
  }

  /**
   * Delete file from disk
   * @param url Public URL of the file to delete
   */
  async deleteFile(url: string): Promise<void> {
    try {
      // Extract filename from URL
      const urlPath = new URL(url).pathname;
      const relativePath = urlPath.replace('/uploads/', '');
      const filePath = path.join(this.uploadDir, relativePath);

      // Delete file if it exists
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      // Silently fail - file might already be deleted
    }
  }
}
