import { Pipe, PipeTransform } from '@angular/core';
import { resolveImageUrl } from '../../core/utils/image-url.util';

@Pipe({
  name: 'assetUrl',
  standalone: true
})
export class AssetUrlPipe implements PipeTransform {
  transform(value?: string | null): string {
    return resolveImageUrl(value);
  }
}
