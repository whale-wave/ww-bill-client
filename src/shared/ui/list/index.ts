import { composeExportComponent } from '@/shared/lib';
import { List } from './list';
import { ListItem } from './list-item';
import './list.scss';

export default composeExportComponent(List, {
  Item: ListItem,
});
