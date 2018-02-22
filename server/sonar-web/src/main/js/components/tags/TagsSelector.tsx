/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as React from 'react';
import BubblePopup, { BubblePopupPosition } from '../common/BubblePopup';
import MultiSelect from '../common/MultiSelect';
import { translate } from '../../helpers/l10n';
import './TagsList.css';

interface Props {
  listSize: number;
  loading: boolean;
  onSearch: (query: string) => void;
  onSelect: (item: string) => void;
  onUnselect: (item: string) => void;
  position: BubblePopupPosition;
  selectedTags: string[];
  tags: string[];
}

export default function TagsSelector(props: Props) {
  return (
    <BubblePopup
      customClass="bubble-popup-bottom-right bubble-popup-menu abs-width-300"
      position={props.position}>
      <MultiSelect
        elements={props.tags}
        listSize={props.listSize}
        loading={props.loading}
        onSearch={props.onSearch}
        onSelect={props.onSelect}
        onUnselect={props.onUnselect}
        placeholder={translate('search.search_for_tags')}
        selectedElements={props.selectedTags}
        validateSearchInput={validateTag}
      />
    </BubblePopup>
  );
}

export function validateTag(value: string) {
  // Allow only a-z, 0-9, '+', '-', '#', '.'
  return value.toLowerCase().replace(/[^-a-z0-9+#.]/gi, '');
}
