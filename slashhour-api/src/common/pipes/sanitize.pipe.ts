import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

/**
 * Sanitization Pipe - 2025 Security Best Practice
 * Removes potentially dangerous HTML/script tags from user input
 * Prevents XSS (Cross-Site Scripting) attacks
 */
@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      // Remove all HTML tags and dangerous content
      return sanitizeHtml(value, {
        allowedTags: [], // No HTML tags allowed
        allowedAttributes: {}, // No attributes allowed
        disallowedTagsMode: 'recursiveEscape', // Escape dangerous tags
      });
    }

    // Recursively sanitize objects
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.map((item) => this.transform(item, metadata));
      }

      const sanitized: any = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          sanitized[key] = this.transform(value[key], metadata);
        }
      }
      return sanitized;
    }

    return value;
  }
}
