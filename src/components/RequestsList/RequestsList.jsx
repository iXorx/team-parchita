import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { actionRequest, getRequestsFromCommunity } from '../../services/Requests';
import styles from './RequestsList.scss';

const RequestsList = ({ communityId, userId: loggedUserId }) => {
  const [requests, setRequests] = useState([]);
  const [requestFinished, setRequestFinished] = useState(false);
  const history = useHistory();

  const getRequests = async () => {
    const response = await getRequestsFromCommunity(communityId);
    setRequests(response.data);
    setRequestFinished(true);
  };

  const handleClickRequest = async (request) => {
    let action = 'accept';
    let actionId = { buyerId: loggedUserId };

    if (request.status === 'accepted') {
      action = 'close';
      actionId = { ownerId: request.ownerId };
    }
    const response = await actionRequest(request.id, actionId, action);
    if (response.ok) {
      getRequests();
    } else {
      setRequestFinished(true);
    }
  };

  const getContact = (ownerId, buyerId) => (
    loggedUserId === ownerId ? buyerId : ownerId
  );

  const handleClickChat = (contact, chatId) => {
    history.push(`/chat/${contact}/${loggedUserId}/${chatId}`);
  };

  useEffect(() => {
    getRequests();
  }, []);

  const renderTextButton = (status) => {
    let statusText;
    switch (status) {
      case 'pending':
        statusText = 'Comprar';
        break;
      case 'accepted':
        statusText = 'Entregat';
        break;
      default:
        statusText = 'Finalitzat';
    }
    return statusText;
  };

  const toDateTime = (secs) => {
    const time = new Date(1970, 0, 1); // Epoch
    time.setSeconds(secs);
    return time.toLocaleDateString();
  };

  const getColor = (status) => {
    let color;
    switch (status) {
      case 'pending':
        color = 'pink';
        break;
      case 'accepted':
        color = 'amber';
        break;
      default:
        color = 'green';
    }
    return color;
  };

  return (
    <div className={styles['requests-container']}>
      {requests.map((request) => {
        const {
          buyerId, categoryId, chatId, createdAt, id, ownerId, status, productsList,
        } = request;
        // eslint-disable-next-line no-underscore-dangle
        const creationDate = toDateTime(createdAt && createdAt._seconds);
        return (
          <div key={id} className={`${styles.item} ${getColor(status)} lighten-5`}>
            <div className={`${getColor(status)} lighten-2 ${styles['owner-date']}`}>
              <div>{ownerId}</div>
              <div>{creationDate}</div>
            </div>
            <div className={styles.products}>
              <div className={`${styles.icon} food-icon-${categoryId}`} />
              <ul>
                {(productsList).map((product) => (
                  <li key={`${request.id}-${product}`}>{product}</li>
                ))}
              </ul>
            </div>
            <div className={styles.action}>
              <button
                type="button"
                tabIndex={0}
                className={`btn-small waves-effect waves-light white-text ${getColor(status)} darken-3`}
                onClick={() => handleClickRequest(request)}
                onKeyPress={() => handleClickRequest(request)}
              >
                {renderTextButton(status)}
              </button>
              {status === 'accepted' && (loggedUserId === ownerId || loggedUserId === buyerId)
                && (
                  <button
                    type="button"
                    tabIndex={0}
                    className={`btn-small waves-effect waves-light white-text ${getColor(status)} darken-3`}
                    onClick={() => handleClickChat(getContact(ownerId, buyerId), chatId)}
                    onKeyPress={() => handleClickChat(getContact(ownerId, buyerId), chatId)}
                  >
                    <i className="material-icons left">chat</i>
                    {`Xat amb ${getContact(ownerId, buyerId)}`}
                  </button>
                )}
            </div>
          </div>
        );
      })}

      {requests.length === 0 && requestFinished && (
        <div className="center">
          <p className={styles.text}>Crea una sol·licitud per començar.</p>

          <Link className="btn-small waves-effect waves-light indigo lighten-1" to="/new-request">
            <i className="material-icons left">add_box</i>
            Nova sol·licitud
          </Link>
        </div>
      )}
    </div>
  );
};

export default RequestsList;