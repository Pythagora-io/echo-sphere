function upvotePost(postId) {
  fetch(`/post/${postId}/upvote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const voteElement = document.getElementById(`post-${postId}-votes`);
      voteElement.innerText = data.newVoteCount;
      console.log('Vote updated for post', postId);
      // Update button styles based on vote status
      updateVoteButtonStyles(postId, data.userVoteStatus, 'post');
    } else {
      console.error('Error updating vote for post:', postId, data.message);
    }
  })
  .catch(error => {
    console.error('Error updating vote for post:', postId, error);
    console.error('Error details:', error.message);
  });
}

function downvotePost(postId) {
  fetch(`/post/${postId}/downvote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const voteElement = document.getElementById(`post-${postId}-votes`);
      voteElement.innerText = data.newVoteCount;
      console.log('Vote updated for post', postId);
      // Update button styles based on vote status
      updateVoteButtonStyles(postId, data.userVoteStatus, 'post');
    } else {
      console.error('Error updating vote for post:', postId, data.message);
    }
  })
  .catch(error => {
    console.error('Error updating vote for post:', postId, error);
    console.error('Error details:', error.message);
  });
}

function upvoteComment(commentId) {
  fetch(`/comment/${commentId}/upvote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const voteElement = document.getElementById(`comment-${commentId}-votes`);
      voteElement.innerText = data.newVoteCount;
      console.log('Vote updated for comment', commentId);
      // Update button styles based on vote status
      updateVoteButtonStyles(commentId, data.userVoteStatus, 'comment');
    } else {
      console.error('Error updating vote for comment:', commentId, data.message);
    }
  })
  .catch(error => {
    console.error('Error updating vote for comment:', commentId, error);
    console.error('Error details:', error.message);
  });
}

function downvoteComment(commentId) {
  fetch(`/comment/${commentId}/downvote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const voteElement = document.getElementById(`comment-${commentId}-votes`);
      voteElement.innerText = data.newVoteCount;
      console.log('Vote updated for comment', commentId);
      // Update button styles based on vote status
      updateVoteButtonStyles(commentId, data.userVoteStatus, 'comment');
    } else {
      console.error('Error updating vote for comment:', commentId, data.message);
    }
  })
  .catch(error => {
    console.error('Error updating vote for comment:', commentId, error);
    console.error('Error details:', error.message);
  });
}

function updateVoteButtonStyles(id, status, type) {
  const upvoteButton = document.getElementById(`${type}-upvote-${id}`);
  const downvoteButton = document.getElementById(`${type}-downvote-${id}`);
  // Reset styles
  upvoteButton.classList.remove('voted');
  downvoteButton.classList.remove('voted');
  // Apply styles based on status
  if (status === 'upvoted') {
    upvoteButton.classList.add('voted');
  } else if (status === 'downvoted') {
    downvoteButton.classList.add('voted');
  }
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
      console.log('Subscription successful to SubSphere', subSphereId);
      location.reload(); // Reload the page to update the subscription status
    } else {
      console.error('Error subscribing to SubSphere:', subSphereId, data.message);
    }
  })
  .catch(error => {
    console.error('Error subscribing to SubSphere:', subSphereId, error);
    console.error('Error details:', error.message);
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
      console.log('Unsubscription successful from SubSphere', subSphereId);
      location.reload(); // Reload the page to update the subscription status
    } else {
      console.error('Error unsubscribing from SubSphere:', subSphereId, data.message);
    }
  })
  .catch(error => {
    console.error('Error unsubscribing from SubSphere:', subSphereId, error);
    console.error('Error details:', error.message);
  });
}

$(document).ready(function() {
  $('.subSphere-select').select2({
    placeholder: "Select a SubSphere",
    allowClear: true
  });

  // Event listeners for subscribe and unsubscribe buttons
  document.querySelectorAll('.subscribe-btn').forEach(button => {
    button.addEventListener('click', function() {
      const subSphereId = this.getAttribute('data-subsphere-id');
      subscribeToSubSphere(subSphereId);
    });
  });

  document.querySelectorAll('.unsubscribe-btn').forEach(button => {
    button.addEventListener('click', function() {
      const subSphereId = this.getAttribute('data-subsphere-id');
      unsubscribeFromSubSphere(subSphereId);
    });
  });
});