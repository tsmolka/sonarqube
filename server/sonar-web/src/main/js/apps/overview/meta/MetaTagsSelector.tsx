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
import { without } from 'lodash';
import TagsSelector from '../../../components/tags/TagsSelector';
import { BubblePopupPosition } from '../../../components/common/BubblePopup';
import { searchProjectTags } from '../../../api/components';

interface Props {
  position: BubblePopupPosition;
  project: string;
  selectedTags: string[];
  setProjectTags: (tags: string[]) => void;
}

interface State {
  loading: boolean;
  searchResult: string[];
}

const LIST_SIZE = 10;

export default class MetaTagsSelector extends React.PureComponent<Props, State> {
  mounted = false;
  state: State = { loading: true, searchResult: [] };

  componentDidMount() {
    this.mounted = true;
    this.onSearch('');
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onSearch = (query: string) => {
    this.setState({ loading: true });
    searchProjectTags({
      q: query,
      ps: Math.min(this.props.selectedTags.length - 1 + LIST_SIZE, 100)
    }).then(
      ({ tags }) => {
        if (this.mounted) {
          this.setState({ loading: false, searchResult: tags });
        }
      },
      () => {
        if (this.mounted) {
          this.setState({ loading: false });
        }
      }
    );
  };

  onSelect = (tag: string) => {
    this.props.setProjectTags([...this.props.selectedTags, tag]);
  };

  onUnselect = (tag: string) => {
    this.props.setProjectTags(without(this.props.selectedTags, tag));
  };

  render() {
    return (
      <TagsSelector
        listSize={LIST_SIZE}
        loading={this.state.loading}
        onSearch={this.onSearch}
        onSelect={this.onSelect}
        onUnselect={this.onUnselect}
        position={this.props.position}
        selectedTags={this.props.selectedTags}
        tags={this.state.searchResult}
      />
    );
  }
}
