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
import { without, uniq } from 'lodash';
import TagsSelector from '../../../components/tags/TagsSelector';
import { getRuleTags } from '../../../api/rules';
import { BubblePopupPosition } from '../../../components/common/BubblePopup';

interface Props {
  organization: string | undefined;
  popupPosition?: BubblePopupPosition;
  setTags: (tags: string[]) => void;
  sysTags: string[];
  tags: string[];
}

interface State {
  loading: boolean;
  searchResult: string[];
}

const LIST_SIZE = 10;

export default class RuleDetailsTagsPopup extends React.PureComponent<Props, State> {
  mounted = false;
  state: State = { loading: false, searchResult: [] };

  componentDidMount() {
    this.mounted = true;
    this.onSearch('');
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onSearch = (query: string) => {
    this.setState({ loading: true });
    getRuleTags({
      q: query,
      ps: Math.min(this.props.tags.length + LIST_SIZE, 100),
      organization: this.props.organization
    }).then(
      tags => {
        if (this.mounted) {
          // systems tags can not be unset, don't display them in the results
          this.setState({ loading: false, searchResult: without(tags, ...this.props.sysTags) });
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
    this.props.setTags(uniq([...this.props.tags, tag]));
  };

  onUnselect = (tag: string) => {
    this.props.setTags(without(this.props.tags, tag));
  };

  render() {
    return (
      <TagsSelector
        listSize={LIST_SIZE}
        loading={this.state.loading}
        onSearch={this.onSearch}
        onSelect={this.onSelect}
        onUnselect={this.onUnselect}
        position={this.props.popupPosition || {}}
        selectedTags={this.props.tags}
        tags={this.state.searchResult}
      />
    );
  }
}
