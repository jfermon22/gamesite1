import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';

// Import Style
import styles from '../../components/Party/PartyPage/PartyPage.css';

// Import Actions
import { fetchScore } from '../../PartyActions';

// Import Selectors
import { getParty } from '../../PartyReducer';

export function PartyDetailPage(props) {
  return (
    <div>
      <Helmet title={props.party.title} />
       <div className={`${styles['single-post']} ${styles['post-detail']}`}>
        <h3 }>{props.party.id}</h3>
        <p className={styles['author-name']}><FormattedMessage id="by" /> {props.post.name}</p>
        <p className={styles['post-desc']}>{props.post.content}</p>
      </div>
    </div>
  );
}

// Actions required to provide data for this component to render in server side.
PartyDetailPage.need = [params => {
  return fetchScore(params.partyid);
}];

// Retrieve data from store as props
function mapStateToProps(state, props) {
  return {
    post: getParty(state, props.params.partyid),
  };
}

PartyDetailPage.propTypes = {
party: PropTypes.shape({
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    cuid: PropTypes.string.isRequired,
  }).isRequired,
};

export default connect(mapStateToProps)(PartyDetailPage);
