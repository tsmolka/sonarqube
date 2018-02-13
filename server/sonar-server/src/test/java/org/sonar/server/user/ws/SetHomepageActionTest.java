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
package org.sonar.server.user.ws;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.sonar.api.server.ws.WebService;
import org.sonar.db.DbClient;
import org.sonar.db.DbTester;
import org.sonar.db.component.ComponentDbTester;
import org.sonar.db.component.ComponentDto;
import org.sonar.db.organization.OrganizationDto;
import org.sonar.db.user.UserDto;
import org.sonar.server.component.TestComponentFinder;
import org.sonar.server.exceptions.UnauthorizedException;
import org.sonar.server.tester.UserSessionRule;
import org.sonar.server.ws.TestResponse;
import org.sonar.server.ws.WsActionTester;

import static org.apache.http.HttpStatus.SC_NO_CONTENT;
import static org.assertj.core.api.Assertions.assertThat;
import static org.sonar.db.component.ComponentTesting.newPrivateProjectDto;

public class SetHomepageActionTest {

  @Rule
  public UserSessionRule userSession = UserSessionRule.standalone();

  @Rule
  public DbTester db = DbTester.create();

  @Rule
  public ExpectedException expectedException = ExpectedException.none();

  private DbClient dbClient = db.getDbClient();
  private SetHomepageAction underTest = new SetHomepageAction(userSession, dbClient, TestComponentFinder.from(db));
  private WsActionTester ws = new WsActionTester(underTest);

  @Test
  public void verify_definition() {
    WebService.Action action = ws.getDef();
    assertThat(action.key()).isEqualTo("set_homepage");
    assertThat(action.isInternal()).isTrue();
    assertThat(action.isPost()).isTrue();
    assertThat(action.since()).isEqualTo("7.0");
    assertThat(action.description()).isEqualTo("Set homepage of current user.<br> Requires authentication.");
    assertThat(action.responseExample()).isNull();
    assertThat(action.handler()).isSameAs(underTest);
    assertThat(action.params()).hasSize(3);

    WebService.Param typeParam = action.param("type");
    assertThat(typeParam.isRequired()).isTrue();
    assertThat(typeParam.description()).isEqualTo("Type of the requested page");
    assertThat(typeParam.possibleValues()).containsExactlyInAnyOrder("PROJECT", "ORGANIZATION", "MY_PROJECTS", "MY_ISSUES");

    WebService.Param componentParam = action.param("component");
    assertThat(componentParam.isRequired()).isFalse();
    assertThat(componentParam.description()).isEqualTo("Project key. It should only be used when parameter 'type' is set to 'PROJECT'");
    assertThat(componentParam.since()).isEqualTo("7.1");

    WebService.Param organizationParam = action.param("organization");
    assertThat(organizationParam.isRequired()).isFalse();
    assertThat(organizationParam.description()).isEqualTo("Organization key. It should only be used when parameter 'type' is set to 'ORGANIZATION'");
    assertThat(organizationParam.since()).isEqualTo("7.1");
  }

  @Test
  public void set_project_homepage() {
    OrganizationDto organization = db.organizations().insert();
    ComponentDto project = new ComponentDbTester(db).insertComponent(newPrivateProjectDto(organization));

    UserDto user = db.users().insertUser();
    userSession.logIn(user);

    ws.newRequest()
      .setMethod("POST")
      .setParam("type", "PROJECT")
      .setParam("component", project.getKey())
      .execute();

    UserDto actual = db.getDbClient().userDao().selectByLogin(db.getSession(), user.getLogin());
    assertThat(actual).isNotNull();
    assertThat(actual.getHomepageType()).isEqualTo("PROJECT");
    assertThat(actual.getHomepageParameter()).isEqualTo(project.uuid());
  }

  @Test
  public void set_organization_homepage() {
    OrganizationDto organization = db.organizations().insert();

    UserDto user = db.users().insertUser();
    userSession.logIn(user);

    ws.newRequest()
      .setMethod("POST")
      .setParam("type", "ORGANIZATION")
      .setParam("organization", organization.getKey())
      .execute();

    UserDto actual = db.getDbClient().userDao().selectByLogin(db.getSession(), user.getLogin());
    assertThat(actual).isNotNull();
    assertThat(actual.getHomepageType()).isEqualTo("ORGANIZATION");
    assertThat(actual.getHomepageParameter()).isEqualTo(organization.getUuid());
  }

  @Test
  public void set_my_issues_homepage() {
    UserDto user = db.users().insertUser();
    userSession.logIn(user);

    ws.newRequest()
      .setMethod("POST")
      .setParam("type", "MY_ISSUES")
      .execute();

    UserDto actual = db.getDbClient().userDao().selectByLogin(db.getSession(), user.getLogin());
    assertThat(actual).isNotNull();
    assertThat(actual.getHomepageType()).isEqualTo("MY_ISSUES");
    assertThat(actual.getHomepageParameter()).isNullOrEmpty();
  }

  @Test
  public void set_my_projects_homepage() {
    UserDto user = db.users().insertUser();
    userSession.logIn(user);

    ws.newRequest()
      .setMethod("POST")
      .setParam("type", "MY_PROJECTS")
      .execute();

    UserDto actual = db.getDbClient().userDao().selectByLogin(db.getSession(), user.getLogin());
    assertThat(actual).isNotNull();
    assertThat(actual.getHomepageType()).isEqualTo("MY_PROJECTS");
    assertThat(actual.getHomepageParameter()).isNullOrEmpty();
  }

  @Test
  public void response_has_no_content() {
    UserDto user = db.users().insertUser();
    userSession.logIn(user);

    TestResponse response = ws.newRequest()
      .setMethod("POST")
      .setParam("type", "MY_PROJECTS")
      .execute();

    assertThat(response.getStatus()).isEqualTo(SC_NO_CONTENT);
    assertThat(response.getInput()).isEmpty();
  }

  @Test
  public void fail_when_missing_project_key_when_requesting_project_type() {
    UserDto user = db.users().insertUser();
    userSession.logIn(user);

    expectedException.expect(IllegalArgumentException.class);
    expectedException.expectMessage("Type PROJECT requires a parameter");

    ws.newRequest()
      .setMethod("POST")
      .setParam("type", "PROJECT")
      .execute();

  }

  @Test
  public void fail_when_missing_organization_id_when_requesting_organization_type() {
    UserDto user = db.users().insertUser();
    userSession.logIn(user);

    expectedException.expect(IllegalArgumentException.class);
    expectedException.expectMessage("Type ORGANIZATION requires a parameter");

    ws.newRequest()
      .setMethod("POST")
      .setParam("type", "ORGANIZATION")
      .execute();
  }

  @Test
  public void fail_for_anonymous() {
    userSession.anonymous();

    expectedException.expect(UnauthorizedException.class);
    expectedException.expectMessage("Authentication is required");

    ws.newRequest().setMethod("POST").execute();
  }
}
