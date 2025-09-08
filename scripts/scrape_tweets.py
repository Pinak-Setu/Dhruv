import json
from ntscraper import Nitter
import logging

# Set up basic logging
logging.basicConfig(level=logging.INFO)

def scrape_and_save():
    """Scrapes tweets using ntscraper and saves them to a JSON file."""
    scraper = Nitter()
    username = 'OPChoudhary_Ind'
    num_tweets = 5000
    
    logging.info(f'Starting to scrape {num_tweets} tweets for user: {username}')
    
    try:
        tweets = scraper.get_tweets(username, mode='user', number=num_tweets)
    except Exception as e:
        logging.error(f'An error occurred during scraping: {e}')
        return

    output_data = []
    if tweets and tweets['tweets']:
        for tweet in tweets['tweets']:
            # Extract desired fields
            output_data.append({
                'id': tweet['link'].split('/')[-1],
                'url': tweet['link'],
                'date': tweet['date'],
                'content': tweet['text'],
                'user': tweet['user']['name'],
                'username': tweet['user']['username'],
                'likes': tweet['stats']['likes'],
                'retweets': tweet['stats']['retweets'],
                'quotes': tweet['stats']['quotes'],
                'comments': tweet['stats']['comments'],
            })

    output_filename = 'opc_tweets_5000.json'
    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    logging.info(f"Successfully scraped and saved {len(output_data)} tweets to {output_filename}")

if __name__ == "__main__":
    scrape_and_save()
