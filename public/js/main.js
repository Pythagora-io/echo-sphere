function upvotePost(postId) {
  fetch(`/votePost/${postId}/upvote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ direction: 'up' }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      document.getElementById(`post-${postId}-votes`).innerText = data.newVoteCount;
      console.log('Upvote successful');
    } else {
      console.error('Error upvoting:', data.message);
    }
  })
  .catch(error => {
    console.error('Error upvoting post:', error);
    console.error(error.stack);
  });
}

function downvotePost(postId) {
  fetch(`/votePost/${postId}/downvote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ direction: 'down' }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      document.getElementById(`post-${postId}-votes`).innerText = data.newVoteCount;
      console.log('Downvote successful');
    } else {
      console.error('Error downvoting:', data.message);
    }
  })
  .catch(error => {
    console.error('Error downvoting post:', error);
    console.error(error.stack);
  });
}

function upvoteComment(commentId) {
  fetch(`/voteComment/${commentId}/upvote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ direction: 'up' }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      document.getElementById(`comment-${commentId}-votes`).innerText = data.newVoteCount;
      console.log('Upvote successful');
    } else {
      console.error('Error upvoting:', data.message);
    }
  })
  .catch(error => {
    console.error('Error upvoting comment:', error);
    console.error(error.stack);
  });
}

function downvoteComment(commentId) {
  fetch(`/voteComment/${commentId}/downvote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ direction: 'down' }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      document.getElementById(`comment-${commentId}-votes`).innerText = data.newVoteCount;
      console.log('Downvote successful');
    } else {
      console.error('Error downvoting:', data.message);
    }
  })
  .catch(error => {
    console.error('Error downvoting comment:', error);
    console.error(error.stack);
  });
}

function subscribeToSubSphere(subSphereId) {
  fetch(`/subscribeToSubSphere`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subSphereId }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log(data.message);
      location.reload(); // Reload the page to update the subscription status
    } else {
      console.error('Error subscribing to SubSphere:', data.message);
    }
  })
  .catch(error => {
    console.error('Error subscribing to SubSphere:', error);
    console.error(error.stack);
  });
}

function unsubscribeFromSubSphere(subSphereId) {
  fetch(`/unsubscribeFromSubSphere`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subSphereId }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log(data.message);
      location.reload(); // Reload the page to update the subscription status
    } else {
      console.error('Error unsubscribing from SubSphere:', data.message);
    }
  })
  .catch(error => {
    console.error('Error unsubscribing from SubSphere:', error);
    console.error(error.stack);
  });
}

$(document).ready(function() {
  $('.subSphere-select').select2({
    placeholder: "Select a SubSphere",
    allowClear: true
  });

  // Event listeners for subscribe and unsubscribe buttons
  $('.subscribe-btn').on('click', function() {
    const subSphereId = $(this).data('subsphere-id');
    subscribeToSubSphere(subSphereId);
  });

  $('.unsubscribe-btn').on('click', function() {
    const subSphereId = $(this).data('subsphere-id');
    unsubscribeFromSubSphere(subSphereId);
  });
});