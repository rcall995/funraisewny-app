const fetchCampaigns = useCallback(async (userId: string) => {
    setLoading(true);
    
    // TEST QUERY: This is the simplest possible query to get your campaigns.
    const { data, error } = await supabase
      .from('campaigns')
      .select('*') // We are only selecting from the campaigns table.
      .eq('organizer_id', userId)
      .eq('status', 'active');

    // These logs are the most important part!
    console.log('--- CAMPAIGN FETCH TEST ---');
    console.log('User ID Used:', userId);
    console.log('Data Received:', data);
    console.error('Error Received:', error);
    console.log('---------------------------');

    if (data) {
      // We use 'as any' here just for this test to avoid type errors.
      setCampaigns(data as any); 
    }
    setLoading(false);
  }, [supabase]);