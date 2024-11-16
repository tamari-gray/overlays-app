using System;
using System.Text;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Linq;
using Newtonsoft.Json;

public class UserVote
{
    public string Username { get; set; }
    public string VoteType { get; set; } // "win" or "lose" type shiiiiit
}

public class LeaderboardEntry
{
    public string Username { get; set; }
    public int Points { get; set; }
}

public class CPHInline
{
    // Private static list to store UserVote objects
    private static List<UserVote> votes = new List<UserVote>();
    private static List<LeaderboardEntry> leaderboard = new List<LeaderboardEntry>();
    
    
    
    // TALK TO SERVER METHODS:
    
    public bool initPredictInDb()
	{
		// Check if personName argument exists
		if (!CPH.TryGetArg("personName", out string personName))
		{
			CPH.SendMessage("personName argument not provided.");
			return false;
		}
		
		// Set up URL and payload
		var url = "http://localhost:3000/startPrediction";
		var payload = JsonConvert.SerializeObject(new { personName });

		using (var client = new HttpClient())
		{
			var content = new StringContent(payload, Encoding.UTF8, "application/json");
			var response = client.PostAsync(url, content).Result;

			if (response.IsSuccessStatusCode)
			{
				CPH.SendMessage("Prediction request sent successfully!");
				return true;
			}
			else
			{
				CPH.SendMessage("Failed to send prediction request.");
				return false;
			}
		}
	}
    
    public bool SendVotePercentage()
	{
		// Calculate the win vote percentage
		int totalVotes = votes.Count;
		int winVotes = votes.Where(vote => vote.VoteType == "win").Count();
		int winVotePercentage = totalVotes > 0 ? (winVotes * 100) / totalVotes : 0;
		
		var url = "http://localhost:3000/updatePrediction";
		
		// Create payload with personName and calculated winVotePercentage
		var payload = JsonConvert.SerializeObject(new {winVotePercentage });

		using (var client = new HttpClient())
		{
			var content = new StringContent(payload, Encoding.UTF8, "application/json");
			var response = client.PostAsync(url, content).Result;
			
			if (response.IsSuccessStatusCode)
			{
				CPH.SendMessage("Prediction request sent successfully!");
				return true;
			}
			else
			{
				CPH.SendMessage("Failed to send prediction request.");
				return false;
			}
		}
		
	}
	
	public bool SendLeaderboard()
    {
        string url = "http://localhost:3000/leaderboard"; // Update with your server URL

        // Serialize the leaderboard list to JSON
        var payload = JsonConvert.SerializeObject(new { leaderboard });

        using (var client = new HttpClient())
        {
            // Set up the content for the POST request
            var content = new StringContent(payload, Encoding.UTF8, "application/json");

            try
            {
                // Send POST request to the server and get the response
                var response = client.PostAsync(url, content).Result;

                if (response.IsSuccessStatusCode)
                {
                    // Success, send a message or log it
                    CPH.SendMessage("Leaderboard sent successfully!");
                    return true;
                }
                else
                {
                    // Failure, log the error
                    CPH.SendMessage($"Failed to send leaderboard. Status Code: {response.StatusCode}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                // Handle any exceptions (e.g., network errors)
                CPH.SendMessage($"Error sending leaderboard: {ex.Message}");
                return false;
            }
        }
    }
    
    
    
    
    
    // Method to add a "win" vote, ensuring the user has not voted yet and voting is open
    public bool AddWinVote()
    {
    	if (CPH.TryGetArg("personName", out string personName)){
    		CPH.SendMessage($"got {personName}!");
    		}
    	
        if (CPH.TryGetArg("userName", out string userName))
        {
        	// Check if accepting predicts is true using the global variable
			bool acceptingPredicts = CPH.GetGlobalVar<bool>("acceptingPredicts");
			if (!acceptingPredicts)
			{
				//CPH.SendMessage($"sorry {userName}, voting has closed for this predict!");
				CPH.SendMessage($"sorry {userName}, voting has closed for this predict!");
				return false;
			}
			else
			{
				// Check if the user has already voted in this prediction
				if (HasUserVoted(userName))
				{
					CPH.SendMessage($"{userName}, you've already voted!");
					return false;
				}

				// Create a new UserVote object and add it to the list
				UserVote newVote = new UserVote
				{
					Username = userName,
					VoteType = "win"
				};
				votes.Add(newVote);
				CPH.SendMessage($"{userName} voted win");
				
				// send it to firebase!
				SendVotePercentage();
				return true;
			}
			return true;
            
        }
        else
        {
            CPH.SendMessage("AddWinVote: Missing username argument.");
            return false;
        }
    }

    public bool AddLoseVote()
	{
		if (CPH.TryGetArg("userName", out string userName))
		{
			// Check if accepting predicts is true using the global variable
			bool acceptingPredicts = CPH.GetGlobalVar<bool>("acceptingPredicts");
			if (!acceptingPredicts)
			{
				CPH.SendMessage($"Sorry {userName}, voting has closed for this predict!");
				return false;
			}
			else
			{
				// Check if the user has already voted in this prediction
				if (HasUserVoted(userName))
				{
					CPH.SendMessage($"{userName}, you've already voted!");
					return false;
				}

				// Create a new UserVote object for the "lose" vote and add it to the list
				UserVote newVote = new UserVote
				{
					Username = userName,
					VoteType = "lose"  // This marks the vote type as "lose"
				};
				votes.Add(newVote);
				CPH.SendMessage($"{userName} voted lose");
				
				// After adding the vote, calculate percentages and send to Firebase
				SendVotePercentage();

				return true;
			}
		}
		else
		{
			CPH.SendMessage("AddLoseVote: Missing username argument.");
			return false;
		}
	}
    

    // Method to clear all votes
    public bool ResetVotes()
    {
        votes.Clear();
        // CPH.SendMessage("Votes have been cleared.");              -- debugging
        CPH.SetGlobalVar("acceptingPredicts", false, true);
        CPH.SetGlobalVar("winPercentage", 0, true); 
		CPH.SetGlobalVar("losePercentage", 0, true);
        
        // write to file - 
        // set timer to 20
        
        return true;
    }

    // Helper method to check if the user has already voted
    private bool HasUserVoted(string userName)
    {
        foreach (UserVote vote in votes)
        {
            if (vote.Username == userName)
            {
                return true;
            }
        }
        return false;
    }
    
    public bool ShowVotes()
	{
		// Check if there are any votes to display
		if (votes.Count == 0)
		{
			CPH.SendMessage("No votes have been cast yet.");
			return false;
		}

		// Create a string to hold the formatted vote results
		string voteResults = "Current Votes:\n";

		// Iterate through the list of UserVote objects and format them
		foreach (UserVote vote in votes)
		{
			voteResults += $"{vote.Username}: {vote.VoteType}\n";
		}

		// Send the formatted vote results to chat
		CPH.SendMessage(voteResults);
		return true;
	}
	
	public bool CalculateAndSetVotePercentages()
	{
		// Check if there are any votes to calculate percentages
		if (votes.Count == 0)
		{
			CPH.SendMessage("No votes for this predict :)");
			ResetVotes();
			return true;
		}

		// Count the number of "win" and "lose" votes
		int winCount = 0;
		int loseCount = 0;

		foreach (UserVote vote in votes)
		{
			if (vote.VoteType == "win")
			{
				winCount++;
			}
			else if (vote.VoteType == "lose")
			{
				loseCount++;
			}
		}

		// Calculate the percentages
		int totalVotes = votes.Count;
		int winPercentage = (winCount / totalVotes) * 100;
		int losePercentage = (loseCount / totalVotes) * 100;

		// Set global variables for winPercentage and losePercentage
		CPH.SetGlobalVar("winPercentage", winPercentage, true); // true indicates this is a persistent global variable
		CPH.SetGlobalVar("losePercentage", losePercentage, true);

		// CPH.SendMessage($"Win Percentage: {winPercentage:F1}% | Lose Percentage: {losePercentage:F1}%");     -- debugging

		return true;
	}
	
	public bool UpdateLeaderboard()
	{
		// Try to get the prediction answer from Streamer.bot's arguments
		if (!CPH.TryGetArg("predictOutcome", out bool predictAnswer))
		{
			CPH.SendMessage("UpdateLeaderboard: Missing predictAnswer argument.");
			return false;
		}

		// Loop through each vote in the votes list
		foreach (UserVote vote in votes)
		{
			// Find or create the leaderboard entry for this user
			LeaderboardEntry userEntry = leaderboard.Find(entry => entry.Username == vote.Username);
			// CPH.SendMessage($"{userEntry.Username}");
			if (userEntry == null)
			{
				// Add user to the leaderboard if they don't already exist
				userEntry = new LeaderboardEntry { Username = vote.Username, Points = 0 };
				leaderboard.Add(userEntry);
			}
			
			// CPH.SendMessage($"vote type:{vote.VoteType}, predictAnswer:{predictAnswer}");   -- debugging

			bool isCorrectPrediction = (vote.VoteType == "win" && predictAnswer == true) ||
										(vote.VoteType == "lose" && predictAnswer == false);

			if (isCorrectPrediction)
			{
				// Correct prediction, increment points
				userEntry.Points++;
				CPH.SendMessage($"Congrats @{vote.Username}, you now have {userEntry.Points} points!");
			}
			else
			{
				// Incorrect prediction, send a message with current points
				CPH.SendMessage($"Sorry @{vote.Username}, your prediction was wrong. You have {userEntry.Points} points.");
			}
		}

		// Sort the leaderboard in descending order by points
		leaderboard.Sort((entry1, entry2) => entry2.Points.CompareTo(entry1.Points));
		return true;
	}
	
    
    public bool AnswerPredict()
	{
		// Check if accepting predictions is false
		bool acceptingPredicts = CPH.GetGlobalVar<bool>("acceptingPredicts");
		if (acceptingPredicts)
		{
			// If acceptingPredicts is true, send a message to mods
			CPH.SendMessage("@mods, please wait for timer to end.");
			return false;
		}
		else
		{
			// If acceptingPredicts is false, check if the prediction is active
			bool predictActive = CPH.GetGlobalVar<bool>("predictActive");

			if (predictActive)
			{
				// send to firebase and get ready for next predict
				UpdateLeaderboard();
				SendLeaderboard();
				ResetVotes();
				return true;
			}
			else
			{
				// If the prediction is not active, send a message to mods
				CPH.SendMessage("@mods, no predict is running!");
				return false;
			}
		}
	}
    
    
    public bool GetUserPointsAndPlacing()
    {
        if (CPH.TryGetArg("userName", out string userName))
        {
            // Find the user in the leaderboard
            LeaderboardEntry userEntry = leaderboard.Find(entry => entry.Username == userName);

            if (userEntry != null)
            {
                // Calculate the user's placing
                int placing = CalculateUserPlacing(userName);

                // Send a message with the user's points and placing
                CPH.SendMessage($"@{userName}, you have {userEntry.Points} points! You're in {placing} place!");
                
                return true;
            }
            else
            {
                CPH.SendMessage($"@{userName}, you don't have any points yet!");
                return false;
            }
        }
        else
        {
            CPH.SendMessage("Username argument not found.");
            return false;
        }
    }
    
    private int CalculateUserPlacing(string userName)
    {
        int placing = 1;
        int currentRank = 1;
        int? lastPoints = null;

        foreach (var entry in leaderboard)
        {
            // If this is a new points value, increment the current rank
            if (lastPoints == null || entry.Points < lastPoints)
            {
                currentRank = placing;
            }

            // If this is the user, return their rank
            if (entry.Username == userName)
            {
                return currentRank;
            }

            // Set last points to current user's points and increment placing counter
            lastPoints = entry.Points;
            placing++;
        }

        return currentRank; // Fallback in case of issues
    }
	
}
