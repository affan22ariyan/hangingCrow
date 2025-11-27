use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    println!("Starting Odds Feed Service...");

    // Mock loop to simulate fetching odds and publishing to Kafka
    loop {
        println!("Fetching odds from provider...");
        // Fetch logic here
        
        println!("Publishing odds to Kafka...");
        // Kafka publish logic here

        sleep(Duration::from_secs(5)).await;
    }
}
