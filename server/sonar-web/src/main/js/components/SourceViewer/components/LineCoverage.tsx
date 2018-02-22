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
import CoveragePopup from './CoveragePopup';
import { SourceLine } from '../../../app/types';
import Dropdown from '../../controls/Dropdown';
import Tooltip from '../../controls/Tooltip';
import { translate } from '../../../helpers/l10n';

interface Props {
  branch: string | undefined;
  componentKey: string;
  line: SourceLine;
}

export default function LineCoverage({ branch, componentKey, line }: Props) {
  const className =
    'source-meta source-line-coverage' +
    (line.coverageStatus != null ? ` source-line-${line.coverageStatus}` : '');

  const hasPopup = line.coverageStatus === 'covered' || line.coverageStatus === 'partially-covered';

  const cell = line.coverageStatus ? (
    <Tooltip overlay={translate('source_viewer.tooltip', line.coverageStatus)} placement="right">
      <div className="source-line-bar" />
    </Tooltip>
  ) : (
    <div className="source-line-bar" />
  );

  if (hasPopup) {
    return (
      <Dropdown>
        {({ onToggleClick, open }) => (
          <td
            className={className}
            data-line-number={line.line}
            onClick={onToggleClick}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
            role="button"
            tabIndex={0}>
            {cell}
            {open && <CoveragePopup branch={branch} componentKey={componentKey} line={line} />}
          </td>
        )}
      </Dropdown>
    );
  }

  return (
    <td className={className} data-line-number={line.line}>
      {cell}
    </td>
  );
}
