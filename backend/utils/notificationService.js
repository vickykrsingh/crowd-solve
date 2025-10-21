import Notification from '../models/Notification.js';

export class NotificationService {
  static async createNotification({
    recipient,
    sender,
    type,
    title,
    message,
    data = {},
    io = null
  }) {
    try {
      // Don't send notification to self
      if (recipient.toString() === sender.toString()) {
        return null;
      }

      const notification = new Notification({
        recipient,
        sender,
        type,
        title,
        message,
        data
      });

      await notification.save();
      await notification.populate('sender', 'username avatar');

      // Send real-time notification
      if (io) {
        io.to(`user-${recipient}`).emit('new-notification', notification);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Notification templates
  static async notifyNewSolution(problemAuthorId, solutionAuthor, problem, solution, io) {
    return await this.createNotification({
      recipient: problemAuthorId,
      sender: solutionAuthor._id,
      type: 'new_solution',
      title: 'New Solution to Your Problem',
      message: `${solutionAuthor.username} posted a solution to "${problem.title}"`,
      data: {
        problemId: problem._id,
        solutionId: solution._id,
        url: `/problems/${problem._id}`
      },
      io
    });
  }

  static async notifyNewComment(solutionAuthorId, commentAuthor, solution, comment, io) {
    return await this.createNotification({
      recipient: solutionAuthorId,
      sender: commentAuthor._id,
      type: 'new_comment',
      title: 'New Comment on Your Solution',
      message: `${commentAuthor.username} commented on your solution`,
      data: {
        problemId: solution.problem,
        solutionId: solution._id,
        commentId: comment._id,
        url: `/problems/${solution.problem}#comment-${comment._id}`
      },
      io
    });
  }

  static async notifyCommentReply(parentCommentAuthorId, replyAuthor, parentComment, reply, io) {
    return await this.createNotification({
      recipient: parentCommentAuthorId,
      sender: replyAuthor._id,
      type: 'comment_reply',
      title: 'Someone Replied to Your Comment',
      message: `${replyAuthor.username} replied to your comment`,
      data: {
        problemId: parentComment.problem,
        solutionId: parentComment.solution,
        commentId: reply._id,
        url: `/problems/${parentComment.problem}#comment-${reply._id}`
      },
      io
    });
  }

  static async notifySolutionUpvoted(solutionAuthorId, upvoter, solution, io) {
    return await this.createNotification({
      recipient: solutionAuthorId,
      sender: upvoter._id,
      type: 'solution_upvoted',
      title: 'Your Solution Was Upvoted',
      message: `${upvoter.username} upvoted your solution`,
      data: {
        problemId: solution.problem,
        solutionId: solution._id,
        url: `/problems/${solution.problem}`
      },
      io
    });
  }

  static async notifyCommentUpvoted(commentAuthorId, upvoter, comment, io) {
    return await this.createNotification({
      recipient: commentAuthorId,
      sender: upvoter._id,
      type: 'comment_upvoted',
      title: 'Your Comment Was Upvoted',
      message: `${upvoter.username} upvoted your comment`,
      data: {
        problemId: comment.problem,
        solutionId: comment.solution,
        commentId: comment._id,
        url: `/problems/${comment.problem}#comment-${comment._id}`
      },
      io
    });
  }

  static async notifyProblemUpvoted(problemAuthorId, upvoter, problem, io) {
    return await this.createNotification({
      recipient: problemAuthorId,
      sender: upvoter._id,
      type: 'problem_upvoted',
      title: 'Your Problem Was Upvoted',
      message: `${upvoter.username} upvoted your problem "${problem.title}"`,
      data: {
        problemId: problem._id,
        url: `/problems/${problem._id}`
      },
      io
    });
  }

  static async notifySolutionAccepted(solutionAuthorId, problemAuthor, solution, io) {
    return await this.createNotification({
      recipient: solutionAuthorId,
      sender: problemAuthor._id,
      type: 'solution_accepted',
      title: 'Your Solution Was Accepted!',
      message: `${problemAuthor.username} marked your solution as the best answer`,
      data: {
        problemId: solution.problem,
        solutionId: solution._id,
        url: `/problems/${solution.problem}`
      },
      io
    });
  }
}