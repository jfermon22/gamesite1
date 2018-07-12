import callApi from '../../util/apiCaller';

// Export Constants
export const GET_PARTY = 'GET_PARTY';

// Export Actions

export function fetchParty(partyId) {
  return (dispatch) => {
    return callApi('party').then(res => {
      dispatch(addParty(res.party));
    });
  };
}
