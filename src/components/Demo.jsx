import { useState, useEffect } from "react";
import { copy, linkIcon, loader, tick, deleteIcon } from "../assets";
import { useLazyGetSummaryQuery } from "../services/article";

const Demo = () => {
  const [article, setArticle] = useState({
    url: '',
    summary: ''
  });
  const [allArticles, setAllArticles] = useState([]);
  const [copied, setCopied] = useState('');
  const [ getSummary, { error, isFetching }]  = useLazyGetSummaryQuery();

  useEffect(() => {
    const articlesFromLocalStorage = JSON.parse(localStorage.getItem('articles'));

    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage)
    }
  }, [setAllArticles])

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = await getSummary({ articleUrl: article.url });
    
    if (data?.summary) {
      const newArticle = {...article, summary: data.summary};
      setArticle(newArticle);
      const updatedAllArticles = [newArticle, ...allArticles];
      setAllArticles(updatedAllArticles);
      localStorage.setItem('articles', JSON.stringify(updatedAllArticles));
      setArticle({...article, url: ''});
    }
  }

  const handleCopy = (copyUrl) =>  {
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopied(false), 3000);
  }

  const handleDelete = (index) =>{
    const newArticles = allArticles.filter((article,i) => i !== index);
    let articlesInLocalStorage = JSON.parse(localStorage.getItem('articles'));
    articlesInLocalStorage.splice(index, 1);
    localStorage.setItem('articles', JSON.stringify(articlesInLocalStorage));
    setAllArticles(newArticles);
  }

  return (
    <section className="mt-16 w-full max-w-xl">
      <div className="flex flex-col w-full gap-2">
        <form onSubmit={handleSubmit} className="relative flex justify-center items-center">
          <img src={linkIcon} alt="link_icon" className="absolute left-0 my-2 ml-3 w-5"/>
          <input 
            type="url"
            placeholder="Enter a URL"
            value={article.url}
            onChange={(e) => setArticle({...article, url: e.target.value})}
            required
            className="url_input peer"
          />
          <button type="submit" className="submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700">
            ⎆
          </button>
        </form>

        {/* Browse URL History */}
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {allArticles.map((article, index) => (
            <div 
              key={`link-${index}`}
              onClick={() => setArticle(article)}
              className="link_card"
            >
              <div className="copy_btn" onClick={() => handleCopy(article.url)}>
                <img src={copied === article.url ? tick : copy} alt="copy_icon" className="w-[40%] h-[40%] object-contain" />
              </div>
              <div className="delete_btn" onClick={() => handleDelete(index)}>
                <img src={deleteIcon} alt="copy_icon" className="w-[40%] h-[40%] object-contain" />
              </div>
              <p className="flex-1 font-futoshi text-blue-700 font-medium text-sm truncate">{article.url}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Displays Results */}
      <div className="my-10 max-w-full flex justify-center items-center">
        {isFetching ? (
          <div className="flex justify-center items-center flex-col">
            <img src={loader} alt="loader-icon" className="w-20 h-20 object-contain"/>
            <p>Generating summary, please wait</p>
          </div>
        ) : error ? (
          <p className="font-inter font-bold text-black text-center">
            That wasn´t supposed to happen...
            <br />
            <span className="font-satoshi font-normal text-gray-700">
              {error?.data?.error}
            </span>
          </p>
        ) : allArticles.length === 0 ? (
          null
        ) : (
          article.summary && (
            <div className="flex flex-col gap-3">
              <h2 className="font-satoshi font-bold text-gray-600 text-xl">
                Article <span className="blue_gradient">Summary</span>
              </h2>
              <div className="summary_box">
                <p className="font-inter font-medium text-sm text-gray-600">{article.summary}</p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  ) 
}

export default Demo