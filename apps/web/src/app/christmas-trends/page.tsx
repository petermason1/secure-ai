'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ChristmasProduct {
  product_name: string;
  category: string;
  estimated_commission_rate: number;
  estimated_commission_per_sale: number;
  trend_score: number;
  search_volume: number;
  competition_level: string;
  price_range: string;
  target_audience: string;
  seasonal_relevance: number;
  viral_potential: number;
  content_ideas: string[];
  youtube_video_ideas: string[];
}

export default function ChristmasTrendsPage() {
  const [products, setProducts] = useState<ChristmasProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ChristmasProduct | null>(null);
  const [contentType, setContentType] = useState<'youtube_script' | 'blog_post' | 'social_media'>('youtube_script');
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [youtubeStatus, setYoutubeStatus] = useState<any>(null);

  const analyzeTrends = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/christmas-trends/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      if (data.success) {
        setProducts(data.products || []);
      } else {
        alert('Error: ' + (data.error || 'Failed to analyze trends'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async (product: ChristmasProduct) => {
    setGeneratingContent(true);
    setSelectedProduct(product);
    try {
      const response = await fetch('/api/christmas-trends/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: product.product_name,
          product_category: product.category,
          content_type: contentType,
          include_affiliate_links: true,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedContent(data.content);
      } else {
        alert('Error: ' + (data.error || 'Failed to generate content'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setGeneratingContent(false);
    }
  };

  const checkYouTubeIntegration = async () => {
    try {
      const response = await fetch('/api/youtube-api/integrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check' }),
      });

      const data = await response.json();
      setYoutubeStatus(data);
    } catch (error: any) {
      console.error('Error checking YouTube:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-xl border border-green-400/30 bg-green-500/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-green-200 mb-2">🎄 Christmas Trends & Amazon Revenue</h1>
              <p className="text-slate-300">Identify trending products, generate sellable content, and maximize affiliate commissions</p>
            </div>
            <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 text-sm">
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* YouTube Integration Status */}
        <div className="mb-6 rounded-xl border border-blue-400/30 bg-blue-500/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-blue-200">📺 YouTube Revenue Stream</h2>
              <p className="text-sm text-slate-300">Integrate YouTube API for additional revenue opportunities</p>
            </div>
            <button
              onClick={checkYouTubeIntegration}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Check Integration
            </button>
          </div>
          {youtubeStatus && (
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-slate-300">
                Status: <span className={youtubeStatus.youtube_api_configured ? 'text-green-400' : 'text-yellow-400'}>
                  {youtubeStatus.youtube_api_configured ? '✅ Configured' : '⚠️ Setup Required'}
                </span>
              </p>
              {youtubeStatus.revenue_opportunities && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-slate-900/60 rounded-lg p-3">
                    <div className="text-xs text-slate-400">Est. Revenue/1K Views</div>
                    <div className="text-lg font-bold text-green-400">£{youtubeStatus.estimated_total_revenue_per_1000_views}</div>
                  </div>
                  <div className="bg-slate-900/60 rounded-lg p-3">
                    <div className="text-xs text-slate-400">Affiliate Links</div>
                    <div className="text-sm text-white">£{youtubeStatus.revenue_opportunities.affiliate_links.estimated_revenue_per_1000_views}/1K</div>
                  </div>
                  <div className="bg-slate-900/60 rounded-lg p-3">
                    <div className="text-xs text-slate-400">Product Placement</div>
                    <div className="text-sm text-white">£{youtubeStatus.revenue_opportunities.product_placement.estimated_revenue_per_1000_views}/1K</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={analyzeTrends}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {loading ? 'Analyzing...' : '🎄 Find Trending Christmas Products'}
          </button>
        </div>

        {/* Products Grid */}
        {products.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Trending Products ({products.length})
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{product.product_name}</h3>
                      <p className="text-sm text-slate-400">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-400">
                        {product.trend_score}%
                      </div>
                      <div className="text-xs text-slate-400">Trend</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <div className="text-slate-400 text-xs">Commission</div>
                      <div className="text-green-400 font-semibold">£{product.estimated_commission_per_sale}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs">Rate</div>
                      <div className="text-white font-semibold">{product.estimated_commission_rate}%</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs">Price</div>
                      <div className="text-white">{product.price_range}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs">Competition</div>
                      <div className={`font-semibold ${
                        product.competition_level === 'low' ? 'text-green-400' :
                        product.competition_level === 'medium' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {product.competition_level}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Viral Potential</span>
                      <span className="text-pink-400">{product.viral_potential}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-pink-500 h-2 rounded-full"
                        style={{ width: `${product.viral_potential}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => generateContent(product)}
                    disabled={generatingContent}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold mb-2"
                  >
                    {generatingContent && selectedProduct?.product_name === product.product_name
                      ? 'Generating...'
                      : '📝 Generate Content'}
                  </button>

                  <div className="text-xs text-slate-500">
                    {product.search_volume.toLocaleString()} searches/mo
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Content */}
        {generatedContent && selectedProduct && (
          <div className="rounded-xl border border-blue-400/30 bg-blue-500/10 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-blue-200">
                Generated Content: {selectedProduct.product_name}
              </h2>
              <select
                value={contentType}
                onChange={(e) => {
                  setContentType(e.target.value as any);
                  setGeneratedContent(null);
                }}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="youtube_script">YouTube Script</option>
                <option value="blog_post">Blog Post</option>
                <option value="social_media">Social Media</option>
              </select>
            </div>

            {contentType === 'youtube_script' && generatedContent.video_title && (
              <div className="space-y-4">
                <div className="bg-slate-900/60 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Video Title</h3>
                  <p className="text-emerald-300">{generatedContent.video_title}</p>
                </div>

                {generatedContent.script && (
                  <div className="bg-slate-900/60 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2">Script</h3>
                    <div className="space-y-3 text-sm text-slate-300">
                      <div>
                        <strong className="text-yellow-400">Hook (0-15s):</strong>
                        <p className="mt-1">{generatedContent.script.hook}</p>
                      </div>
                      <div>
                        <strong className="text-blue-400">Intro:</strong>
                        <p className="mt-1">{generatedContent.script.intro}</p>
                      </div>
                      <div>
                        <strong className="text-purple-400">Main Content:</strong>
                        <p className="mt-1">{generatedContent.script.main_content}</p>
                      </div>
                      <div>
                        <strong className="text-green-400">Affiliate Mention:</strong>
                        <p className="mt-1">{generatedContent.script.affiliate_mention}</p>
                      </div>
                      <div>
                        <strong className="text-rose-400">Outro:</strong>
                        <p className="mt-1">{generatedContent.script.outro}</p>
                      </div>
                    </div>
                  </div>
                )}

                {generatedContent.video_description && (
                  <div className="bg-slate-900/60 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2">Video Description</h3>
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap">{generatedContent.video_description}</pre>
                  </div>
                )}

                {generatedContent.affiliate_links && generatedContent.affiliate_links.length > 0 && (
                  <div className="bg-slate-900/60 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2">Affiliate Links</h3>
                    <div className="space-y-2">
                      {generatedContent.affiliate_links.map((link: any, i: number) => (
                        <div key={i} className="text-sm">
                          <span className="text-emerald-400">{link.text}:</span>{' '}
                          <span className="text-blue-400">{link.url}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {generatedContent.estimated_revenue && (
                  <div className="bg-green-500/20 rounded-lg p-4 border border-green-400/30">
                    <div className="text-sm text-slate-400 mb-1">Estimated Revenue</div>
                    <div className="text-2xl font-bold text-green-400">£{generatedContent.estimated_revenue}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Based on {generatedContent.estimated_views?.toLocaleString() || '50K'} views
                    </div>
                  </div>
                )}
              </div>
            )}

            {contentType === 'blog_post' && (
              <div className="bg-slate-900/60 rounded-lg p-4">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap">
                  {JSON.stringify(generatedContent, null, 2)}
                </pre>
              </div>
            )}

            {contentType === 'social_media' && (
              <div className="bg-slate-900/60 rounded-lg p-4">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap">
                  {JSON.stringify(generatedContent, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {products.length === 0 && !loading && (
          <div className="text-center py-12 rounded-xl border border-white/10 bg-slate-900/60">
            <p className="text-slate-400 mb-4">No products analyzed yet.</p>
            <button
              onClick={analyzeTrends}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              🎄 Find Trending Christmas Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

