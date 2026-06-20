export class FileHelper {
  /**
   * Read file content as text
   */
  static async readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsText(file);
    });
  }

  /**
   * Convert file content to lines
   */
  static toLines(content: string): string[] {
    return content.split('\n');
  }

  /**
   * Get file extension
   */
  static getExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Check if file is text-based
   */
  static isTextFile(filename: string): boolean {
    const textExtensions = ['txt', 'js', 'ts', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml', 'md'];
    const ext = this.getExtension(filename);
    return textExtensions.includes(ext);
  }

  /**
   * Format file size
   */
  static formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
