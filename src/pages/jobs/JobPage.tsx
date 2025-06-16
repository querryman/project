import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, ArrowLeft, User, Building, MapPin, Clock, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import { InterestsList } from '../../components/InterestsList';
import toast from 'react-hot-toast';

type Job = Database['public']['Tables']['jobs']['Row'] & {
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export const JobPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { convertPrice, formatPrice, currentCurrency } = useCurrency();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        // First fetch the job details
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();

        if (jobError) throw jobError;

        // Then fetch the profile details
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', jobData.user_id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          // Don't throw here, we can still show the job without profile info
        }

        setJob({
          ...jobData,
          profiles: profileData
        });

        // Check if user has already applied
        if (user) {
          const { data: resumeData } = await supabase
            .from('resumes')
            .select('*')
            .eq('job_id', id)
            .eq('user_id', user.id);

          setHasApplied(resumeData && resumeData.length > 0);
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id, user]);

  const handleApply = async () => {
    if (!user) {
      toast.error('Please log in to apply');
      navigate('/login');
      return;
    }

    if (!resume) {
      toast.error('Please upload your resume');
      return;
    }

    try {
      setSubmitting(true);

      // Upload resume file
      const fileExt = resume.name.split('.').pop();
      const fileName = `${user.id}/${id}/${Math.random()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('resumes')
        .upload(fileName, resume);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      // Create resume record
      const { error: insertError } = await supabase
        .from('resumes')
        .insert({
          job_id: id,
          user_id: user.id,
          file_url: publicUrl,
          cover_letter: coverLetter
        });

      if (insertError) throw insertError;

      // Create interest record
      const { error: interestError } = await supabase
        .from('interests')
        .insert({
          listing_type: 'job',
          listing_id: id,
          interested_user_id: user.id,
          message: coverLetter,
          contact_info: user.email
        });

      if (interestError) throw interestError;

      setHasApplied(true);
      toast.success('Application submitted successfully!');
      setCoverLetter('');
      setResume(null);
    } catch (error) {
      console.error('Error applying for job:', error);
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Job not found</h2>
          <button
            onClick={() => navigate('/jobs')}
            className="mt-4 inline-flex items-center text-purple-600 hover:text-purple-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to jobs
          </button>
        </div>
      </div>
    );
  }

  const convertedSalary = job.salary ? convertPrice(job.salary, job.currency_code) : null;
  const displaySalary = convertedSalary ? formatPrice(convertedSalary) : 'Not specified';
  const originalSalaryDisplay = job.salary && job.currency_code !== currentCurrency?.code
    ? formatPrice(job.salary, job.currency_code)
    : null;

  const isJobOwner = user?.id === job.user_id;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/jobs')}
          className="mb-8 inline-flex items-center text-purple-600 hover:text-purple-800"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to jobs
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
                <div className="flex flex-wrap gap-4 text-gray-500">
                  {job.company && (
                    <div className="flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      <span>{job.company}</span>
                    </div>
                  )}
                  {job.location && (
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{job.job_type}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    <span>
                      {displaySalary}
                      {originalSalaryDisplay && (
                        <span className="text-sm text-gray-500 ml-1">
                          (Originally {originalSalaryDisplay})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="prose max-w-none">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                  <div className="text-gray-600 whitespace-pre-line">{job.description}</div>
                </div>

                {isJobOwner && (
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Applications</h2>
                    <InterestsList listingId={job.id} listingType="job" />
                  </div>
                )}
              </div>

              <div className="md:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-6">
                    {job.profiles?.avatar_url ? (
                      <img
                        src={job.profiles.avatar_url}
                        alt={job.profiles.username || 'Recruiter'}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-purple-600" />
                      </div>
                    )}
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {job.profiles?.username || 'Anonymous'}
                      </h3>
                      <p className="text-sm text-gray-500">Posted {new Date(job.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {!isJobOwner && (
                    <div>
                      {hasApplied ? (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <Briefcase className="h-5 w-5 text-green-400" />
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-green-800">
                                Application Submitted
                              </h3>
                              <p className="mt-2 text-sm text-green-700">
                                You've already applied for this position. The recruiter will contact you soon.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Cover Letter (Optional)
                            </label>
                            <textarea
                              value={coverLetter}
                              onChange={(e) => setCoverLetter(e.target.value)}
                              rows={4}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              placeholder="Tell us why you're a great fit for this position..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Resume*
                            </label>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => setResume(e.target.files?.[0] || null)}
                              className="w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-purple-50 file:text-purple-700
                                hover:file:bg-purple-100"
                            />
                          </div>

                          <button
                            onClick={handleApply}
                            disabled={submitting || !resume}
                            className="w-full bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
                          >
                            {submitting ? 'Submitting...' : 'Apply Now'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};