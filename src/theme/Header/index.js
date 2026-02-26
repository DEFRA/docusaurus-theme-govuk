/**
 * Forked from @not-govuk/header (MIT Licence)
 * Copyright (C) 2019–2021 Crown Copyright
 * Copyright (C) 2019–2021 Daniel A.C. Martin
 *
 * Modifications: added `children` prop rendered as a flex sibling inside the
 * header container, allowing content (e.g. a search bar) to be injected into
 * the right-hand side of `govuk-header__container`.
 */

import React from 'react';
import {classBuilder} from '@react-foundry/component-helpers';
import {Link} from '@not-govuk/link';
import {WidthContainer} from '@not-govuk/width-container';
import {CrownLogo} from '@not-govuk/header/dist/CrownLogo';
import {CrownLogoOld} from '@not-govuk/header/dist/CrownLogoOld';
import {CoatLogo} from '@not-govuk/header/dist/CoatLogo';
import '@not-govuk/header/assets/Header.scss';

const departmentMap = {
  'home-office': 'Home Office',
  'department-for-communities-and-local-government': 'DCLG',
  'department-for-culture-media-sport': 'DCMS',
  'department-for-environment-food-rural-affairs': 'DEFRA',
  'department-for-work-pensions': 'DWP',
  'foreign-commonwealth-development-office': 'FCDO',
  'foreign-commonwealth-office': 'FCO',
  'hm-revenue-customs': 'HMRC',
  'hm-treasury': 'HM Treasury',
  'ministry-of-justice': 'MoJ',
  'office-of-the-leader-of-the-house-of-lords': '',
  'scotland-office': 'Scotland Office',
  'wales-office': 'Wales Office',
};

const departmentText = (d) => {
  if (!d) return null;
  return (
    departmentMap[d] ||
    d
      .split('-')
      .map((e) => {
        switch (e) {
          case 'and': return '';
          case 'hm':  return 'HM';
          case 'for': return '';
          case 'of':  return 'o';
          case 'the': return '';
          default:    return e.charAt(0).toUpperCase();
        }
      })
      .join('')
  );
};

const Header = ({
  children,
  classBlock,
  classModifiers: _classModifiers = [],
  className,
  department,
  govUK = false,
  maxContentsWidth,
  navigation = [],
  organisationHref,
  organisationText,
  rebrand = false,
  serviceHref = '/',
  serviceName,
  signOutHref,
  signOutText = 'Sign out',
  logo: _logo,
  ...attrs
}) => {
  const classModifiers = Array.isArray(_classModifiers)
    ? _classModifiers
    : [_classModifiers];

  const classes = classBuilder(
    'govuk-header',
    classBlock,
    [...classModifiers, department],
    className,
  );

  const A = (props) => (
    <Link classBlock={classes('link')} {...props} />
  );

  const orgHref = organisationHref || (govUK ? 'https://www.gov.uk/' : '/');
  const orgText =
    organisationText || (govUK ? 'GOV.UK' : departmentText(department));

  const navLinks = !signOutHref
    ? navigation
    : [...navigation, {href: signOutHref, text: signOutText, forceExternal: true}];

  const logo =
    _logo !== undefined
      ? _logo
      : govUK
        ? rebrand
          ? <CrownLogo focusable="false" className={classes('logotype')} height="30" width="162" />
          : <CrownLogoOld focusable="false" className={classes('logotype')} height="30" width="148" />
        : <CoatLogo aria-hidden="true" focusable="false" className={classes('logotype', ['coat'])} height="30" width="36" />;

  return (
    <header {...attrs} className={classes()} data-module="govuk-header">
      <WidthContainer maxWidth={maxContentsWidth} className={classes('container')}>
        <div className={classes('logo')}>
          <A
            href={orgHref}
            classModifiers={[
              'homepage',
              orgText && orgText.length > 9 ? 'small' : undefined,
            ]}
          >
            {logo}
            {govUK ? null : (
              <span className={classes('logotype-text')}>{orgText}</span>
            )}
          </A>
        </div>

        {(serviceName || navLinks.length) ? (
          <div className={classes('content')}>
            {serviceName && (
              <A href={serviceHref} className={classes('service-name')}>
                {serviceName}
              </A>
            )}
            {navLinks.length ? (
              <nav className={classes('navigation')} aria-label="Menu">
                <button
                  type="button"
                  className={classes(
                    'menu-button',
                    undefined,
                    'govuk-js-header-toggle',
                  )}
                  aria-controls="navigation"
                  hidden
                >
                  Menu
                </button>
                <ul id="navigation" className={classes('navigation-list')}>
                  {navLinks.map(({active, text, ...linkAttrs}, i) => (
                    <li
                      key={i}
                      className={classes(
                        'navigation-item',
                        active ? 'active' : undefined,
                      )}
                    >
                      <A {...linkAttrs}>{text}</A>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>
        ) : null}

        {children}
      </WidthContainer>
    </header>
  );
};

export default Header;
