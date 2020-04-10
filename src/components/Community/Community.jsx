import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../Header/Header';
import styles from './Community.scss';
import { getCommunity } from '../../services/Community';
import { actionRequest, getRequestsFromCommunity } from '../../services/Requests';

const Community = () => {
  const [nameCommunity, setNameCommunity] = useState('');
  const [requests, setRequests] = useState([]);
  const { communityId } = useParams();
  const buyerId = 'volunteerUser';

  if (window.localStorage) {
    window.localStorage.setItem('communityId', communityId);
  }

  const getNameOfCommunity = async () => {
    const response = await getCommunity(communityId);
    setNameCommunity(response.name);
  };

  const getRequests = async () => {
    const response = await getRequestsFromCommunity(communityId);
    setRequests(response.data);
  };

  const handleClickRequest = async (request) => {
    let action = 'accept';
    let actionId = { buyerId };

    if (request.status === 'accepted') {
      action = 'close';
      actionId = { ownerId: request.ownerId };
    }
    const response = await actionRequest(request.id, actionId, action);
    if (response.ok) {
      getRequests();
    }
  };

  useEffect(() => {
    getNameOfCommunity();
    getRequests();
  }, []);

  const renderTextButton = (status) => {
    if (status === 'pending') {
      return 'Ajudar';
    }
    if (status === 'accepted') {
      return 'En Marxa';
    }
    return 'Acabada';
  };

  return (
    <>
      <Header title={`Comunitat ${nameCommunity}`} />
      <div className="container">
        <h1 className="vertical-container">List of requests of community</h1>
        <Link className="" to="/new-request">Nova sol·licitud</Link>
        <div className={styles['requests-container']}>
          {requests.map((request) => (
            <div key={request.id} className={styles['request-item']}>
              <div className={`${styles['request-category']}`}>
                <div className={`${styles['category-icon']} food-icon-${request.categoryId}`} />
                <div className={styles['item-owner']}>{request.ownerId}</div>
              </div>
              <div className={styles['request-products']}>
                <ul>
                  {(request.productsList).map((product) => (
                    <li key={`${request.id}-${product}`}>{product}</li>
                  ))}
                </ul>
              </div>
              <span>{request.status}</span>
              <div
                role="button"
                tabIndex={0}
                className={`btn-small waves-effect waves-light indigo${request.status === 'pending' ? '' : ' disable'}`}
                onClick={() => handleClickRequest(request)}
                onKeyPress={() => handleClickRequest(request)}
              >
                {renderTextButton(request.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Community;
