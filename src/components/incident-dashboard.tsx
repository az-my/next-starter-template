'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Database, Cloud, FileText, AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useOAuth } from '@/hooks/useOAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type IncidentRecord = {
  id: string;
  id_incident: string;
  crossing_zona: string;
  foto_odo_awal?: string;
  foto_tim_awal?: string;
  foto_odo_akhir?: string;
  foto_tim_akhir?: string;
  started_at?: string;
  stopped_at?: string;
  duration?: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  description?: string;
  is_synced_to_sheet?: boolean;
  is_image_uploaded?: boolean;
};

type DashboardStats = {
  total: number;
  driveSync: {
    synced: number;
    pending: number;
  };
  sheetSync: {
    synced: number;
    pending: number;
  };
  statusBreakdown: {
    active: number;
    completed: number;
    cancelled: number;
    other: number;
  };
};

export default function IncidentDashboard() {
  const [records, setRecords] = useState<IncidentRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    driveSync: { synced: 0, pending: 0 },
    sheetSync: { synced: 0, pending: 0 },
    statusBreakdown: { active: 0, completed: 0, cancelled: 0, other: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [syncFilter, setSyncFilter] = useState('all');
  const { tokens, isAuthenticated } = useOAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('incident_serpo')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRecords(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: IncidentRecord[]) => {
    const total = data.length;
    const driveSync = {
      synced: data.filter(r => r.is_image_uploaded).length,
      pending: data.filter(r => !r.is_image_uploaded).length
    };
    const sheetSync = {
      synced: data.filter(r => r.is_synced_to_sheet).length,
      pending: data.filter(r => !r.is_synced_to_sheet).length
    };
    const statusBreakdown = {
      active: data.filter(r => r.status === 'active').length,
      completed: data.filter(r => r.status === 'completed').length,
      cancelled: data.filter(r => r.status === 'cancelled').length,
      other: data.filter(r => !['active', 'completed', 'cancelled'].includes(r.status)).length
    };

    setStats({ total, driveSync, sheetSync, statusBreakdown });
  };

  const filteredRecords = records.filter(record => {
    const matchesText = filter === '' || 
      record.id_incident.toLowerCase().includes(filter.toLowerCase()) ||
      record.crossing_zona.toLowerCase().includes(filter.toLowerCase()) ||
      (record.description && record.description.toLowerCase().includes(filter.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    const matchesSync = syncFilter === 'all' || 
      (syncFilter === 'drive-synced' && record.is_image_uploaded) ||
      (syncFilter === 'drive-pending' && !record.is_image_uploaded) ||
      (syncFilter === 'sheet-synced' && record.is_synced_to_sheet) ||
      (syncFilter === 'sheet-pending' && !record.is_synced_to_sheet) ||
      (syncFilter === 'fully-synced' && record.is_image_uploaded && record.is_synced_to_sheet) ||
      (syncFilter === 'not-synced' && !record.is_image_uploaded && !record.is_synced_to_sheet);
    
    return matchesText && matchesStatus && matchesSync;
  });

  const getSyncStatusBadge = (driveSync: boolean, sheetSync: boolean) => {
    if (driveSync && sheetSync) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Fully Synced</Badge>;
    } else if (driveSync || sheetSync) {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Partial Sync</Badge>;
    } else {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Not Synced</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Incident Serpo Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive view of incident data and sync status</p>
        </div>
        <Button onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Incident records in database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drive Sync</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.driveSync.synced}</div>
            <p className="text-xs text-muted-foreground">
              {stats.driveSync.pending} pending sync
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sheet Sync</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.sheetSync.synced}</div>
            <p className="text-xs text-muted-foreground">
              {stats.sheetSync.pending} pending sync
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.statusBreakdown.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.statusBreakdown.completed} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search incidents..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full p-2 border rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sync">Sync Status</Label>
              <select
                id="sync"
                className="w-full p-2 border rounded-md"
                value={syncFilter}
                onChange={(e) => setSyncFilter(e.target.value)}
              >
                <option value="all">All Sync States</option>
                <option value="fully-synced">Fully Synced</option>
                <option value="drive-synced">Drive Synced</option>
                <option value="sheet-synced">Sheet Synced</option>
                <option value="drive-pending">Drive Pending</option>
                <option value="sheet-pending">Sheet Pending</option>
                <option value="not-synced">Not Synced</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilter('');
                  setStatusFilter('all');
                  setSyncFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Records ({filteredRecords.length})</CardTitle>
          <CardDescription>
            Detailed view of all incident records with sync status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incident ID</TableHead>
                  <TableHead>Crossing Zone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Drive Sync</TableHead>
                  <TableHead>Sheet Sync</TableHead>
                  <TableHead>Overall Sync</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No records found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.id_incident}</TableCell>
                      <TableCell>{record.crossing_zona}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{record.duration || 'N/A'}</TableCell>
                      <TableCell>
                        {record.is_image_uploaded ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />Synced
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <Clock className="w-3 h-3 mr-1" />Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.is_synced_to_sheet ? (
                          <Badge variant="default" className="bg-blue-500">
                            <CheckCircle className="w-3 h-3 mr-1" />Synced
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <Clock className="w-3 h-3 mr-1" />Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {getSyncStatusBadge(record.is_image_uploaded || false, record.is_synced_to_sheet || false)}
                      </TableCell>
                      <TableCell>
                        {new Date(record.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}