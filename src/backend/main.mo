import Int "mo:core/Int";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";

actor {
  type StudySession = {
    id : Nat;
    topic : Text;
    difficulty : Text;
    days : Nat;
    concepts : Text;
    notes : Text;
    quiz : Text;
    studyPlan : Text;
    timestamp : Int;
  };

  var nextId = 0;
  let sessions = Map.empty<Nat, StudySession>();

  module StudySession {
    public func compareByTimestamp(s1 : StudySession, s2 : StudySession) : Order.Order {
      Int.compare(s2.timestamp, s1.timestamp);
    };
  };

  // Content generation functions
  func generateConcepts(topic : Text) : Text {
    "## Overview\n- Introduction to " # topic #
    " concepts\n- Historical context and relevance\n- Impact and significance in related fields\n\n" #
    "## Core Concepts\n- Fundamental principles\n- Key terminology and definitions\n- Practical applications\n\n" #
    "## Beginner Explanation\n- Simplified examples\n- Analogies for understanding\n- Visual representations and diagrams\n\n" #
    "## Intermediate Details\n- Deeper exploration\n- Case studies and real-world scenarios\n- Problem-solving techniques\n\n" #
    "## Advanced Insights\n- Complex scenarios\n- Mathematical modeling and analysis\n- Theoretical underpinnings\n\n" #
    "## Real-world Applications\n- Industry-specific uses\n- Innovations and advancements\n- Societal impact and future trends";
  };

  func generateNotes(topic : Text) : Text {
    "## Key Definitions\n- Essential terms\n- Clear explanations\n- Contextual examples\n\n" #
    "## Important Formulas\n- Equations and algorithms\n- Step-by-step solutions\n- Practical use cases\n\n" #
    "## Core Principles\n- Guiding concepts\n- Foundational frameworks\n- Best practice approaches\n\n" #
    "## Common Mistakes to Avoid\n- Frequent errors\n- Pitfall prevention\n- Tips for success\n\n" #
    "## Quick Reference Summary\n- Key points table\n- Visual representations\n- Condensed takeaways";
  };

  func generateQuiz(topic : Text) : Text {
    "Q1: What is the primary use of " # topic # "?\n" #
    "A) Option 1\nB) Option 2\nC) Option 3\nD) Option 4\n" #
    "Correct Answer: B\nExplanation: This is the correct answer because...\n\n" #
    "Q2: Which of the following is a key benefit of " # topic # "?\n" #
    "A) Option 1\nB) Option 2\nC) Option 3\nD) Option 4\n" #
    "Correct Answer: D\nExplanation: This is the correct answer because...\n\n" #
    "Q3: How does " # topic # " apply in real-world scenarios?\n" #
    "A) Option 1\nB) Option 2\nC) Option 3\nD) Option 4\n" #
    "Correct Answer: A\nExplanation: This is the correct answer because...\n\n" #
    "Q4: What is a common challenge when using " # topic # "?\n" #
    "A) Option 1\nB) Option 2\nC) Option 3\nD) Option 4\n" #
    "Correct Answer: C\nExplanation: This is the correct answer because...\n\n" #
    "Q5: Which principle best represents " # topic # "?\n" #
    "A) Option 1\nB) Option 2\nC) Option 3\nD) Option 4\n" #
    "Correct Answer: B\nExplanation: This is the correct answer because...\n\n";
  };

  func generateStudyPlan(topic : Text, days : Nat) : Text {
    var plan = "## " # days.toText() # "-Day Study Plan for " # topic # "\n\n";
    var day = 1;
    while (day <= days) {
      plan #= "## Day " # day.toText() # ": Focus Area\n";
      plan #= "- Morning Block: In-depth study session, video lectures\n";
      plan #= "- Afternoon Block: Practice problems, hands-on projects\n";
      plan #= "- Evening Block: Review concepts, recap key areas\n\n";
      day += 1;
    };
    plan # "## Tips for Success\n- Consistent practice and application\n- Collaboration and discussion with peers\n- Continuous learning and improvement";
  };

  public shared ({ caller }) func generateStudyContent(
    topic : Text,
    difficulty : Text,
    days : Nat,
  ) : async Nat {
    let session : StudySession = {
      id = nextId;
      topic;
      difficulty;
      days;
      concepts = generateConcepts(topic);
      notes = generateNotes(topic);
      quiz = generateQuiz(topic);
      studyPlan = generateStudyPlan(topic, days);
      timestamp = Time.now();
    };

    sessions.add(nextId, session);
    nextId += 1;
    nextId - 1;
  };

  public query ({ caller }) func getSession(id : Nat) : async ?StudySession {
    sessions.get(id);
  };

  public query ({ caller }) func getAllSessions() : async [StudySession] {
    sessions.values().toArray().sort(StudySession.compareByTimestamp);
  };

  public shared ({ caller }) func deleteSession(id : Nat) : async Bool {
    if (sessions.containsKey(id)) {
      sessions.remove(id);
      true;
    } else {
      false;
    };
  };

  public query ({ caller }) func getSessionCount() : async Nat {
    sessions.size();
  };
};
